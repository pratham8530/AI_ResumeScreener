import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Award, User, CheckSquare } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  matchScore: number;
  matchBreakdown: {
    skills: number;
    experience: number;
    education: number;
    industryRelevance: number;
  };
  skills: string[];
}

interface VisualInsightsProps {
  candidates: Candidate[];
  jobSkills: string[];
}

const VisualInsights: FC<VisualInsightsProps> = ({ candidates, jobSkills }) => {
  const [activeTab, setActiveTab] = useState('candidateComparison');
  
  const topCandidates = [...candidates]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
  
  const candidateComparisonData = candidates.slice(0, 8).map(candidate => ({
    name: candidate.name,
    score: candidate.matchScore,
  }));
  
  const weightDistributionData = [
    { name: 'Skills Match', value: 40, color: '#4F46E5' },
    { name: 'Experience', value: 35, color: '#10B981' },
    { name: 'Education', value: 15, color: '#6366F1' },
    { name: 'Industry Fit', value: 10, color: '#8B5CF6' },
  ];
  
  const COLORS = ['#4F46E5', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
  
  const skillComparisonData = jobSkills.map(skill => {
    const candidatesWithSkill = candidates.filter(candidate => 
      candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;
    
    return {
      name: skill,
      count: candidatesWithSkill,
      percentage: (candidatesWithSkill / candidates.length) * 100
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const radarData = topCandidates.map(candidate => ({
    name: candidate.name,
    skills: candidate.matchBreakdown.skills,
    experience: candidate.matchBreakdown.experience,
    education: candidate.matchBreakdown.education,
    industryFit: candidate.matchBreakdown.industryRelevance,
  }));

  const averageSkills = candidates.reduce((sum, candidate) => sum + candidate.matchBreakdown.skills, 0) / candidates.length;
  const averageExperience = candidates.reduce((sum, candidate) => sum + candidate.matchBreakdown.experience, 0) / candidates.length;
  const averageEducation = candidates.reduce((sum, candidate) => sum + candidate.matchBreakdown.education, 0) / candidates.length;
  const averageIndustryFit = candidates.reduce((sum, candidate) => sum + candidate.matchBreakdown.industryRelevance, 0) / candidates.length;

  const candidateDiversityData = [
    { name: 'Experience Level', value: [
      { name: 'Junior (0-2 yrs)', value: 20 },
      { name: 'Mid-level (3-5 yrs)', value: 45 },
      { name: 'Senior (6+ yrs)', value: 35 }
    ]},
    { name: 'Education', value: [
      { name: 'Bachelors', value: 55 },
      { name: 'Masters', value: 35 },
      { name: 'PhD', value: 5 },
      { name: 'Other', value: 5 }
    ]},
    { name: 'Location', value: [
      { name: 'Local', value: 60 },
      { name: 'Remote (Same Country)', value: 25 },
      { name: 'International', value: 15 }
    ]}
  ];

  const distributionData = candidates.map(candidate => ({
    name: candidate.name,
    skills: candidate.matchBreakdown.skills,
    experience: candidate.matchBreakdown.experience,
    score: candidate.matchScore,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Talent Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Data-driven insights from {candidates.length} candidates in your talent pool
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Top Match Score</p>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {Math.max(...candidates.map(c => c.matchScore))}%
              </div>
            </div>
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Match</p>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)}%
              </div>
            </div>
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Skills Coverage</p>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {Math.round(skillComparisonData.reduce((sum, skill) => sum + (skill.percentage >= 60 ? 1 : 0), 0) / skillComparisonData.length * 100)}%
              </div>
            </div>
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                {Math.round(candidates.length * 0.25)}
              </div>
            </div>
            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="candidateComparison" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full max-w-md mx-auto grid grid-cols-4 h-auto bg-muted/50">
          <TabsTrigger value="candidateComparison" className="py-2">Ranking</TabsTrigger>
          <TabsTrigger value="skillComparison" className="py-2">Skills</TabsTrigger>
          <TabsTrigger value="candidateInsights" className="py-2">Insights</TabsTrigger>
          <TabsTrigger value="distribution" className="py-2">Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="candidateComparison">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
              <CardTitle className="flex items-center gap-2">
                Candidate Match Scores
                <Badge variant="outline" className="ml-2 font-normal">Top Performers</Badge>
              </CardTitle>
              <CardDescription>
                Overall match scores for each candidate based on job requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={candidateComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      label={{ 
                        value: 'Match Score (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Match Score']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#4F46E5" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {candidateComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score > 85 ? '#10B981' : entry.score > 70 ? '#6366F1' : '#4F46E5'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-sm text-muted-foreground text-center">
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#10B981]"></div>
                    <span>Excellent (85%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#6366F1]"></div>
                    <span>Good (70-85%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#4F46E5]"></div>
                    <span>Average (&lt;70%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skillComparison">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
              <CardTitle className="flex items-center gap-2">
                Required Skills Coverage
                <Badge variant="outline" className="ml-2 font-normal">Skills Gap Analysis</Badge>
              </CardTitle>
              <CardDescription>
                Percentage of candidates who possess each required skill
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillComparisonData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Candidates with skill']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="percentage" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {skillComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.percentage > 80 ? '#10B981' : entry.percentage > 50 ? '#6366F1' : '#F59E0B'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-sm flex flex-col items-center">
                <div className="text-muted-foreground mb-2">
                  Skills coverage indicates how well the candidate pool meets required skills for the position
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#10B981]"></div>
                    <span>Strong (80%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#6366F1]"></div>
                    <span>Moderate (50-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#F59E0B]"></div>
                    <span>Gap (&lt;50%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidateInsights">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
              <CardTitle className="flex items-center gap-2">
                Top Candidate Competency Analysis
                <Badge variant="outline" className="ml-2 font-normal">Multi-dimensional</Badge>
              </CardTitle>
              <CardDescription>
                Comparison of top 5 candidates across key evaluation criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {topCandidates.map((candidate, index) => (
                      <Radar
                        key={`radar-${candidate.id}`}
                        name={candidate.name}
                        dataKey={index === 0 ? "skills" : index === 1 ? "experience" : index === 2 ? "education" : "industryFit"}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip 
                      formatter={(value) => [`${value}%`]}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-muted/20 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Key Insights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Top candidates excel in technical skills (avg. {Math.round(averageSkills)}%)</li>
                  <li>• Work experience scores are generally strong (avg. {Math.round(averageExperience)}%)</li>
                  <li>• Education credentials show more variability (avg. {Math.round(averageEducation)}%)</li>
                  <li>• Industry relevance is an area for targeted improvement (avg. {Math.round(averageIndustryFit)}%)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
              <CardTitle className="flex items-center gap-2">
                Candidate Distribution Analysis
                <Badge variant="outline" className="ml-2 font-normal">Pattern Analysis</Badge>
              </CardTitle>
              <CardDescription>
                Relationship between skills, experience, and overall match scores
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      dataKey="skills" 
                      name="Skills" 
                      domain={[0, 100]} 
                      label={{ value: 'Skills Match (%)', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="experience" 
                      name="Experience" 
                      domain={[0, 100]} 
                      label={{ value: 'Experience Match (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="score" 
                      range={[50, 500]} 
                      name="Score" 
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [
                        `${value}%`, 
                        name === 'Score' ? 'Overall Score' : name
                      ]}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      labelFormatter={(label) => distributionData[label].name}
                    />
                    <Scatter 
                      name="Candidates" 
                      data={distributionData} 
                      fill="#8884d8"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score > 85 ? '#10B981' : entry.score > 70 ? '#6366F1' : '#4F46E5'} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-sm text-muted-foreground text-center">
                <div>Bubble size indicates overall match score. Position shows relationship between skills and experience.</div>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span>High match (85%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div>
                    <span>Medium (70-85%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
                    <span>Lower (&lt;70%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 bg-muted/40 rounded-md p-4 text-sm border border-border">
        <h4 className="font-medium flex items-center mb-2">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">i</span>
          </div>
          Actionable Insights
        </h4>
        <p className="text-muted-foreground mb-2">
          These visual insights are powered by AI analysis of your candidate pool against the job description. 
          Use this data to make informed decisions when shortlisting candidates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background/80 p-3 rounded-md border border-border/50">
            <h5 className="font-medium text-xs uppercase text-muted-foreground mb-1">Skills Gap</h5>
            <p className="text-sm">Consider candidates with {skillComparisonData.filter(s => s.percentage < 50).map(s => s.name).slice(0, 2).join(', ')} skills to improve overall coverage.</p>
          </div>
          <div className="bg-background/80 p-3 rounded-md border border-border/50">
            <h5 className="font-medium text-xs uppercase text-muted-foreground mb-1">Top Recommendation</h5>
            <p className="text-sm">{topCandidates[0]?.name} shows exceptional balance across all evaluation criteria.</p>
          </div>
          <div className="bg-background/80 p-3 rounded-md border border-border/50">
            <h5 className="font-medium text-xs uppercase text-muted-foreground mb-1">Interview Strategy</h5>
            <p className="text-sm">Focus on assessing practical experience for candidates with high skills but lower experience scores.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInsights;
