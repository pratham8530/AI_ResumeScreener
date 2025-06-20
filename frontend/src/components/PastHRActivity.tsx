import { useNavigate } from "react-router-dom"; // Added useNavigate
import { motion } from "framer-motion"; // Corrected motion import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  Label
} from "recharts";

interface HRActivity {
  _id: string;
  jdId: string;
  jobTitle: string;
  shortlistedCandidates: {
    id: string;
    name: string;
    email: string;
    phone: string;
    experience: number;
    education: { institution?: string; degree?: string; gpa?: string | number };
    skills: string[];
    experienceDetails: { company: string; role: string; duration: string }[];
    matchScore: number;
    matchBreakdown: {
      skills: number;
      experience: number;
      education: number;
      industryRelevance: number;
      projects: number;
      certifications: number;
      keywordMatch: number;
    };
    quick_analysis?: { summary: string; skills_gap: string[]; red_flags: string[]; highlights: string[] };
    currentStatus?: string;
  }[];
  date: string;
}

interface PastHRActivityProps {
  hrActivityHistory: HRActivity[];
}

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"];

const PastHRActivity = ({ hrActivityHistory }: PastHRActivityProps) => {
  const navigate = useNavigate(); // Added navigate function

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  // Calculate status distribution for the pie chart
  const getStatusDistribution = () => {
    const statusCount = hrActivityHistory.flatMap(activity => activity.shortlistedCandidates)
      .reduce((acc, candidate) => {
        acc[candidate.currentStatus || "Pending"] = (acc[candidate.currentStatus || "Pending"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  // Calculate overall statistics
  const totalSessions = hrActivityHistory.length;
  const totalShortlisted = hrActivityHistory.reduce((sum, a) => sum + a.shortlistedCandidates.length, 0);
  const totalProcessed = hrActivityHistory.reduce((sum, a) => sum + (a.shortlistedCandidates.length || 0), 0); // Adjust based on actual processed data if available
  const avgMatchScore = totalShortlisted > 0 
    ? (hrActivityHistory.reduce((sum, a) => sum + a.shortlistedCandidates.reduce((s, c) => s + c.matchScore, 0), 0) / totalShortlisted * 100).toFixed(2)
    : "0.00";
  const highestMatchScore = hrActivityHistory
    .flatMap(a => a.shortlistedCandidates)
    .reduce((max, c) => Math.max(max, c.matchScore), 0) * 100;
  const topSkills = [...new Set(hrActivityHistory.flatMap(a => a.shortlistedCandidates.flatMap(c => c.skills)))]
    .slice(0, 5)
    .join(", ");

  const statusData = getStatusDistribution();

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2"
      >
        Past HR Activity
        <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
          {totalSessions} Sessions
        </Badge>
      </motion.h1>
      {hrActivityHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">No past HR activity recorded</h3>
          <p className="text-muted-foreground">End a screening session to view history.</p>
        </motion.div>
      ) : (
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-600 dark:text-indigo-400">Overall Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">Total Sessions: <span className="font-bold text-indigo-700 dark:text-indigo-300">{totalSessions}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Total Shortlisted: <span className="font-bold text-indigo-700 dark:text-indigo-300">{totalShortlisted}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Total Processed: <span className="font-bold text-indigo-700 dark:text-indigo-300">{totalProcessed}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Avg Match Score: <span className="font-bold text-green-600 dark:text-green-400">{avgMatchScore}%</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Highest Match Score: <span className="font-bold text-green-600 dark:text-green-400">{highestMatchScore.toFixed(2)}%</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Top Skills: <span className="font-bold text-purple-700 dark:text-purple-300">{topSkills}</span></p>
                </div>
                <div className="col-span-2 flex items-center justify-center h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label
                          value="Candidate Status"
                          position="center"
                          className="text-gray-800 dark:text-gray-200 font-bold"
                        />
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value} Candidates`, name]}
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff', borderRadius: '5px' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ color: '#000000', fontSize: '14px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrActivityHistory.map((activity, index) => {
              const avgMatch = activity.shortlistedCandidates.length > 0
                ? (activity.shortlistedCandidates.reduce((sum, c) => sum + c.matchScore, 0) / activity.shortlistedCandidates.length * 100).toFixed(2)
                : "0.00";
              return (
                <motion.div
                  key={activity._id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        {activity.jobTitle}
                        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {activity.date}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Shortlisted: {activity.shortlistedCandidates.length} | Total Processed: {activity.shortlistedCandidates.length} | Avg Match: {avgMatch}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {activity.shortlistedCandidates.map((candidate) => (
                          <div key={candidate.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-gray-200">{candidate.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.email}</p>
                            </div>
                            <Badge
                              variant={
                                candidate.currentStatus === "Hired" ? "default"
                                  : candidate.currentStatus === "Offered" ? "outline"
                                  : candidate.currentStatus === "Interview Scheduled" ? "secondary"
                                  : "destructive"
                              }
                              className="text-white"
                            >
                              {candidate.currentStatus || "Pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => navigate("/shortlist")} // Changed navigator to navigate
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Back to Shortlist
        </Button>
      </div>
    </div>
  );
};

export default PastHRActivity;