import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import StepTimeline from "@/components/StepTimeline";
import JDUploader from "@/components/JDUploader";
import JDPreviewCard from "@/components/JDPreviewCard";
import CVUploader from "@/components/CVUploader";
import CandidateCard from "@/components/CandidateCard";
import EmailModal from "@/components/EmailModal";
import FeedbackTunerButton from "@/components/FeedbackTunerButton";
import Settings from "./Settings";
import PastHRActivity from "@/components/PastHRActivity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Filter, ArrowUpDown, Download, Upload as UploadIcon } from "lucide-react";

interface Skill {
  skill: string;
  variants: string[];
}

interface JobDescription {
  title: string;
  summary: string;
  skills: Skill[];
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
  originalText: string;
  _id: string;
}

interface ExperienceDetail {
  company: string;
  role: string;
  duration: string;
}

interface MatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  industryRelevance: number;
  projects: number;
  certifications: number;
  keywordMatch: number;
}

interface QuickAnalysis {
  summary: string;
  skills_gap: string[];
  red_flags: string[];
  highlights: string[];
}

interface Education {
  institution?: string;
  degree?: string;
  gpa?: string | number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  education: Education;
  skills: string[];
  experienceDetails: ExperienceDetail[];
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  quick_analysis?: QuickAnalysis;
  currentStatus?: string;
}

interface HRActivity {
  _id: string;
  jdId: string;
  jobTitle: string;
  shortlistedCandidates: Candidate[];
  date: string;
}

interface WeightItem {
  name: string;
  weight: number;
  category: "skills" | "experience" | "education" | "other";
}

interface Step {
  id: number;
  name: string;
  description: string;
  status: "complete" | "current" | "upcoming";
}

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Candidate[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [shortlistThreshold, setShortlistThreshold] = useState(75);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [shortlistView, setShortlistView] = useState<"all" | "auto" | "manual">("all");
  const [hrActivityHistory, setHRActivityHistory] = useState<HRActivity[]>([]);
  const [showCVUploader, setShowCVUploader] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const steps: Step[] = [
    { id: 1, name: "Job Description", description: "Upload and analyze JD", status: jobDescription ? "complete" : "current" },
    { id: 2, name: "Candidate Matching", description: "Upload and score CVs", status: jobDescription && candidates.length > 0 ? "complete" : jobDescription ? "current" : "upcoming" },
    { id: 3, name: "Shortlist", description: "Select and contact candidates", status: candidates.length > 0 ? "current" : "upcoming" },
  ];

  const initialWeights: WeightItem[] = [
    { name: "React", weight: 90, category: "skills" },
    { name: "TypeScript", weight: 80, category: "skills" },
    { name: "JavaScript", weight: 75, category: "skills" },
    { name: "Frontend Development", weight: 85, category: "experience" },
    { name: "Team Leadership", weight: 60, category: "experience" },
    { name: "Years of Experience", weight: 70, category: "experience" },
    { name: "Computer Science Degree", weight: 50, category: "education" },
    { name: "Industry Knowledge", weight: 65, category: "other" },
  ];

  useEffect(() => {
    const fetchLatestJD = async () => {
      try {
        const response = await axios.get('https://ai-resumescrenner.onrender.com/api/jds',{
          withCredentials: true,
        });
        const jds = response.data;
        if (jds.length > 0) {
          const latestJD = jds[0];
          setJobDescription(latestJD);
          setJdId(latestJD._id);
          const cvResponse = await axios.get(`https://ai-resumescrenner.onrender.com/api/cvs/${latestJD._id}`,{
            withCredentials: true,
          });
          const formattedCandidates = cvResponse.data.map((cv: any) => ({
            id: cv._id,
            name: cv.name,
            email: cv.email,
            phone: cv.phone,
            skills: cv.skills,
            education: cv.education,
            experience: cv.experience,
            work_experience: cv.work_experience,
            experienceDetails: cv.experience_details,
            certifications: cv.certifications,
            projects: cv.projects,
            matchScore: Number(cv.match_score) || 0,
            matchBreakdown: cv.match_breakdown,
            quick_analysis: cv.quick_analysis,
            currentStatus: cv.current_status || "Pending",
          }));
          setCandidates(formattedCandidates);
          setFilteredCandidates(formattedCandidates);
          setShowCVUploader(false);
        }
      } catch (error) {
        console.error('Error fetching JDs or CVs:', error);
      }
    };
    fetchLatestJD();

    const fetchHRActivity = async () => {
      try {
        const response = await axios.get('https://ai-resumescrenner.onrender.com/api/hr-activity',{
          withCredentials: true,
        });
        setHRActivityHistory(response.data);
      } catch (error) {
        console.error('Error fetching HR activity:', error);
      }
    };
    fetchHRActivity();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      const sorted = [...candidates].sort((a, b) => (sortOrder === "desc" ? b.matchScore - a.matchScore : a.matchScore - b.matchScore));
      setFilteredCandidates(sorted);
    }
  }, [candidates, sortOrder]);

  const handleJdProcessed = async (data: JobDescription, id: string) => {
    try {
      await axios.delete(`https://ai-resumescrenner.onrender.com/api/cvs/${id}`,{
        withCredentials: true,
      });
      setCandidates([]);
      setFilteredCandidates([]);
      setShortlistedCandidates([]);
    } catch (error) {
      console.error('Error clearing CVs:', error);
    }
    setJobDescription(data);
    setJdId(id);
  };

  const resetJd = () => {
    setJobDescription(null);
    setJdId(null);
    setCandidates([]);
    setFilteredCandidates([]);
    setShortlistedCandidates([]);
  };

  const handleCVsProcessed = (data: { processed_cvs: Candidate[] }) => {
    if (data.processed_cvs && Array.isArray(data.processed_cvs)) {
      const newCandidates = data.processed_cvs.filter(newCand => !candidates.some(c => c.id === newCand.id));
      setCandidates(prev => [...prev, ...newCandidates]);
      setFilteredCandidates(prev => [...prev, ...newCandidates]);
      setShowCVUploader(false);
    } else {
      console.warn("No valid candidates in response:", data);
    }
  };

  const handleShortlistCandidate = (candidate: Candidate) => {
    if (!shortlistedCandidates.some(c => c.id === candidate.id)) {
      setShortlistedCandidates([...shortlistedCandidates, candidate]);
    }
  };

  const handleRemoveFromShortlist = (candidateId: string) => {
    setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidateId));
  };

  const handleEmailCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEmailModalOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleWeightsChange = (newWeights: WeightItem[]) => {
    console.log("Weights updated:", newWeights);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const autoShortlist = () => {
    const autoShortlisted = candidates.filter(c => Number(c.matchScore) * 100 >= shortlistThreshold);
    autoShortlisted.forEach(candidate => {
      console.log(`Checking candidate ${candidate.name}: matchScore=${Number(candidate.matchScore) * 100}%, threshold=${shortlistThreshold}`, Number(candidate.matchScore) * 100 >= shortlistThreshold);
    });
    console.log("Candidates with matchScore >= threshold:", autoShortlisted);
    setShortlistedCandidates(autoShortlisted);
    setFilteredCandidates([...filteredCandidates]);
  };

  const endScreeningSession = async () => {
    if (jobDescription && shortlistedCandidates.length > 0) {
      try {
        await axios.post(`https://ai-resumescrenner.onrender.com/api/end-session/${jdId}`, { shortlistedCandidates },{ withCredentials: true });
        setCandidates([]);
        setFilteredCandidates([]);
        setShortlistedCandidates([]);
        const response = await axios.get('https://ai-resumescrenner.onrender.com/api/hr-activity',{ withCredentials: true });
        setHRActivityHistory(response.data);
        navigate("/shortlist");
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };

  const emailAllShortlisted = () => {
    alert(`Preparing to email all ${shortlistedCandidates.length} shortlisted candidates`);
  };

  const proceedToCandidateMatching = () => {
    navigate("/candidates");
  };

  const toggleCVUploader = () => {
    setShowCVUploader(prev => !prev);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarNav />
      <div className="flex-1 flex flex-col pl-64">
        <Header
          currentJobTitle={jobDescription ? jobDescription.title : "Upload a Job Description"}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="p-6 overflow-y-auto">
          {location.pathname !== "/settings" && <StepTimeline steps={steps} />}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  jobDescription ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <JDPreviewCard jobDescription={jobDescription} onReset={resetJd} />
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={proceedToCandidateMatching}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Proceed to Candidate Matching
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <JDUploader onJdProcessed={handleJdProcessed} />
                    </motion.div>
                  )
                } />
                <Route path="/candidates" element={
                  jobDescription ? (
                    <div className="animate-fade-in space-y-6">
                      {candidates.length === 0 && jdId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-center"
                        >
                          <CVUploader onCVsProcessed={handleCVsProcessed} jdId={jdId} onClose={() => setShowCVUploader(false)} />
                        </motion.div>
                      )}
                      {candidates.length > 0 && (
                        <>
                          <div className="mb-6 flex justify-between items-end">
                            <div>
                              <h2 className="text-2xl font-bold mb-2">Candidate Matches</h2>
                              <p className="text-muted-foreground">
                                Found {candidates.length} potential matches for {jobDescription?.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <FeedbackTunerButton
                                weights={initialWeights}
                                jobTitle={jobDescription?.title || ""}
                                onWeightsChanged={handleWeightsChange}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleSortOrder}
                                className="flex items-center gap-1"
                              >
                                <ArrowUpDown className="h-4 w-4" />
                                {sortOrder === "desc" ? "Highest First" : "Lowest First"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleCVUploader}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                              >
                                <UploadIcon className="h-4 w-4" />
                                Upload More CVs
                              </Button>
                            </div>
                          </div>
                          {showCVUploader && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-center"
                            >
                              <CVUploader onCVsProcessed={handleCVsProcessed} jdId={jdId} onClose={() => setShowCVUploader(false)} />
                            </motion.div>
                          )}
                          {filteredCandidates.map((candidate, index) => (
                            <CandidateCard
                              key={candidate.id}
                              candidate={candidate}
                              index={index}
                              showActions={false}
                            />
                          ))}
                          <div className="mt-6 flex justify-end">
                            <Button
                              onClick={() => navigate('/shortlist')}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              View Shortlist
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                            Start with a Job Description
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Please upload a job description to begin the candidate matching process.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center h-full">
                          <Button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          >
                            <UploadIcon className="h-5 w-5" />
                            Upload Job Description
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                } />
                <Route path="/shortlist" element={
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Candidate Shortlist</h2>
                        <p className="text-muted-foreground">
                          {shortlistedCandidates.length} candidates shortlisted for {jobDescription?.title || ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <FeedbackTunerButton
                          weights={initialWeights}
                          jobTitle={jobDescription?.title || ""}
                          onWeightsChanged={handleWeightsChange}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={emailAllShortlisted}
                          disabled={shortlistedCandidates.length === 0}
                          className="flex items-center gap-1.5"
                        >
                          <Mail className="h-4 w-4" />
                          Email All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {}}
                          className="flex items-center gap-1.5"
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      <div className="xl:col-span-1">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              Shortlist Controls
                            </CardTitle>
                            <CardDescription>
                              Configure automatic shortlisting
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">
                                Match Threshold: {shortlistThreshold}%
                              </label>
                              <Slider
                                value={[shortlistThreshold]}
                                min={50}
                                max={95}
                                step={5}
                                onValueChange={(value) => setShortlistThreshold(value[0])}
                                className="py-4"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>50% (Inclusive)</span>
                                <span>95% (Selective)</span>
                              </div>
                            </div>
                            <div className="pt-3">
                              <Button
                                onClick={autoShortlist}
                                className="w-full"
                                variant="secondary"
                              >
                                Auto-Shortlist Candidates
                              </Button>
                              <p className="text-xs text-muted-foreground mt-2">
                                Will shortlist {candidates.filter(c => Number(c.matchScore) * 100 >= shortlistThreshold).length} candidates with {shortlistThreshold}%+ match
                              </p>
                            </div>
                            <div className="pt-2">
                              <Tabs value={shortlistView} onValueChange={(value) => setShortlistView(value as "all" | "auto" | "manual")} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="all">All</TabsTrigger>
                                  <TabsTrigger value="auto">Auto ({candidates.filter(c => Number(c.matchScore) * 100 >= shortlistThreshold).length})</TabsTrigger>
                                  <TabsTrigger value="manual">Manual ({shortlistedCandidates.length})</TabsTrigger>
                                </TabsList>
                              </Tabs>
                            </div>
                            {jobDescription && (
                              <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-medium mb-2">Job Requirements</h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {jobDescription.skills.map((skillObj, idx) => (
                                    <Badge key={idx} variant="outline">{skillObj.skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      <div className="xl:col-span-3">
                        {filteredCandidates.length > 0 ? (
                          <div className="space-y-4">
                            {filteredCandidates.map((candidate, index) => (
                              <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                index={index}
                                onEmailClick={handleEmailCandidate}
                                onShortlistClick={
                                  shortlistedCandidates.some(c => c.id === candidate.id)
                                    ? () => handleRemoveFromShortlist(candidate.id)
                                    : () => handleShortlistCandidate(candidate)
                                }
                                isShortlisted={shortlistedCandidates.some(c => c.id === candidate.id)}
                                showActions={true}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-muted/20 rounded-lg border border-t">
                            <h3 className="text-lg font-medium mb-2">No candidates match the current criteria</h3>
                            <p className="text-muted-foreground mb-4">
                              Try adjusting the threshold or adding candidates to your shortlist
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={endScreeningSession}
                        disabled={shortlistedCandidates.length === 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        End Screening Session
                      </Button>
                    </div>
                  </div>
                } />
                <Route path="/past-hr-activity" element={<PastHRActivity hrActivityHistory={hrActivityHistory} />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        candidate={selectedCandidate}
        jobTitle={jobDescription?.title || ""}
      />
    </div>
  );
};

export default Index;