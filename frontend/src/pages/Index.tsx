import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import StepTimeline from "@/components/StepTimeline";
import JDUploader from "@/components/JDUploader";
import JDPreviewCard from "@/components/JDPreviewCard";
import CVUploader from "@/components/CVUploader";
import CandidateCard from "@/components/CandidateCard";
import VisualInsights from "@/components/VisualInsights";
import EmailModal from "@/components/EmailModal";
import FeedbackTunerButton from "@/components/FeedbackTunerButton";
import Settings from "./Settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Filter, ArrowUpDown, Download } from "lucide-react";

interface JobDescription {
  title: string;
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
  originalText: string;
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
}

interface Education {
  institution?: string;
  degree?: string;
  gpa?: string | number;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  experience: number;
  education: Education;
  skills: string[];
  experienceDetails: ExperienceDetail[];
  matchScore: number;
  matchBreakdown: MatchBreakdown;
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
  const [jdId, setJdId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Candidate[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [shortlistThreshold, setShortlistThreshold] = useState(75);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [shortlistView, setShortlistView] = useState<"all" | "auto" | "manual">("all");
  const location = useLocation();
  const navigate = useNavigate();

  const steps: Step[] = [
    { id: 1, name: "Job Description", description: "Upload and analyze JD", status: jobDescription ? "complete" : "current" },
    { id: 2, name: "Candidate Matching", description: "Upload and score CVs", status: jobDescription && candidates.length > 0 ? "complete" : jobDescription ? "current" : "upcoming" },
    { id: 3, name: "Insights", description: "Visualize matches and Analyze data", status: candidates.length > 0 ? "complete" : "upcoming" },
    { id: 4, name: "Shortlist", description: "Select and contact and Send Emails", status: candidates.length > 0 ? "current" : "upcoming" }
  ];

  const initialWeights: WeightItem[] = [
    { name: "React", weight: 90, category: "skills" },
    { name: "TypeScript", weight: 80, category: "skills" },
    { name: "JavaScript", weight: 75, category: "skills" },
    { name: "Frontend Development", weight: 85, category: "experience" },
    { name: "Team Leadership", weight: 60, category: "experience" },
    { name: "Years of Experience", weight: 70, category: "experience" },
    { name: "Computer Science Degree", weight: 50, category: "education" },
    { name: "Industry Knowledge", weight: 65, category: "other" }
  ];

  useEffect(() => {
    if (candidates.length > 0) {
      const filtered = [...candidates].filter(c => {
        if (shortlistView === "all") return true;
        if (shortlistView === "auto") return c.matchScore >= shortlistThreshold;
        if (shortlistView === "manual") return shortlistedCandidates.some(sc => sc.id === c.id);
        return true;
      });
      const sorted = filtered.sort((a, b) => (sortOrder === "desc" ? b.matchScore - a.matchScore : a.matchScore - b.matchScore));
      setFilteredCandidates(sorted);
    }
  }, [candidates, shortlistThreshold, sortOrder, shortlistView, shortlistedCandidates]);

  const handleJdProcessed = (data: JobDescription, id: number) => {
    setJobDescription(data);
    setJdId(id);
  };

  const handleCVsProcessed = (data: { processed_cvs: Candidate[] }) => {
    console.log("Handling processed CVs:", data);
    if (data.processed_cvs && Array.isArray(data.processed_cvs)) {
      setCandidates(data.processed_cvs);
      setFilteredCandidates(data.processed_cvs);
    } else {
      console.warn("No valid candidates in response:", data);
      setCandidates([]);
      setFilteredCandidates([]);
    }
  };

  const handleShortlistCandidate = (candidate: Candidate) => {
    if (!shortlistedCandidates.some(c => c.id === candidate.id)) {
      setShortlistedCandidates([...shortlistedCandidates, candidate]);
    }
  };

  const handleRemoveFromShortlist = (candidateId: number) => {
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

  const handleWeightsChanged = (newWeights: WeightItem[]) => {
    console.log("Weights updated:", newWeights);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const autoShortlist = () => {
    const autoShortlisted = candidates.filter(c => c.matchScore >= shortlistThreshold);
    setShortlistedCandidates(autoShortlisted);
  };

  const emailAllShortlisted = () => {
    alert(`Preparing to email all ${shortlistedCandidates.length} shortlisted candidates`);
  };

  const proceedToCandidateMatching = () => {
    navigate("/candidates");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SidebarNav pathname={location.pathname} />
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
                    <div className="space-y-4 animate-fade-in">
                      <JDPreviewCard jobDescription={jobDescription} />
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={proceedToCandidateMatching}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Proceed to Candidate Matching
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <JDUploader onJdProcessed={handleJdProcessed} />
                    </div>
                  )
                } />
                <Route path="/candidates" element={
                  candidates.length > 0 ? (
                    <div className="animate-fade-in space-y-6">
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
                            onWeightsChanged={handleWeightsChanged}
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
                        </div>
                      </div>
                      {filteredCandidates.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          index={index}
                          showActions={false} // No actions on Candidate Matching page
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      {jdId ? (
                        <CVUploader onCVsProcessed={handleCVsProcessed} jdId={jdId} />
                      ) : (
                        <p>Please upload a job description first.</p>
                      )}
                      {jdId && candidates.length === 0 && (
                        <p className="text-center text-muted-foreground">
                          No candidates processed yet. Upload CVs to see matches.
                        </p>
                      )}
                    </div>
                  )
                } />
                <Route path="/insights" element={
                  <div className="space-y-6">
                    <div className="mb-6 flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Visual Insights</h2>
                        <p className="text-muted-foreground">
                          Analytics and visualizations for {jobDescription?.title || "this job position"}
                        </p>
                      </div>
                      <FeedbackTunerButton
                        weights={initialWeights}
                        jobTitle={jobDescription?.title || ""}
                        onWeightsChanged={handleWeightsChanged}
                      />
                    </div>
                    {candidates.length > 0 && jobDescription && (
                      <VisualInsights
                        candidates={candidates}
                        jobSkills={jobDescription.skills}
                      />
                    )}
                  </div>
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
                          onWeightsChanged={handleWeightsChanged}
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
                                Will shortlist {candidates.filter(c => c.matchScore >= shortlistThreshold).length} candidates with {shortlistThreshold}%+ match
                              </p>
                            </div>
                            <div className="pt-2">
                              <Tabs value={shortlistView} onValueChange={(value) => setShortlistView(value as "all" | "auto" | "manual")} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="all">All</TabsTrigger>
                                  <TabsTrigger value="auto">Auto ({candidates.filter(c => c.matchScore >= shortlistThreshold).length})</TabsTrigger>
                                  <TabsTrigger value="manual">Manual ({shortlistedCandidates.length})</TabsTrigger>
                                </TabsList>
                              </Tabs>
                            </div>
                            {jobDescription && (
                              <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-medium mb-2">Job Requirements</h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {jobDescription.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline">{skill}</Badge>
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
                                showActions={true} // Show actions on Shortlist page
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                            <h3 className="text-lg font-medium mb-2">No candidates match the current criteria</h3>
                            <p className="text-muted-foreground mb-4">
                              Try adjusting the threshold or adding candidates to your shortlist
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                } />
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