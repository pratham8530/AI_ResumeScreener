import { FC, useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Star, Clock, Award, BarChart2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
}

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  onEmailClick?: (candidate: Candidate) => void;
  onShortlistClick?: (candidate: Candidate) => void;
  isShortlisted?: boolean;
  showActions?: boolean;
}

const CandidateCard: FC<CandidateCardProps> = ({ 
  candidate, 
  index,
  onEmailClick, 
  onShortlistClick,
  isShortlisted = false,
  showActions = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const displayScore = Math.min(Math.max(Math.round(candidate.matchScore * 100), 0), 100);
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-accent';
    if (score >= 70) return 'text-primary';
    return 'text-secondary';
  };

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 85) return 'bg-accent/20';
    if (score >= 70) return 'bg-primary/20';
    return 'bg-secondary/20';
  };

  return (
    <Card className={`mb-4 transition-all shadow-md hover:shadow-lg ${expanded ? 'ring-1 ring-primary/20' : ''} ${isShortlisted ? 'ring-1 ring-accent' : ''}`}>
      <CardHeader className="pb-0 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <div className={`h-20 w-20 rounded-full ${getScoreBackgroundColor(displayScore)} flex items-center justify-center`}>
                  <svg className="absolute top-0 left-0 h-20 w-20" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="progress-ring-bg text-muted/30"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className={`progress-ring-value ${getScoreColor(displayScore)}`}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <span className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
                    {displayScore}
                  </span>
                </div>
                <span className="absolute -top-2 -left-2 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.email} • {candidate.phone}</p>
              <div className="flex items-center mt-1 text-sm">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{candidate.experience} years experience</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {candidate.skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 5 && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    +{candidate.skills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEmailClick?.(candidate)} 
                      className="border border-primary/20 hover:bg-primary/5">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button 
                size="sm" 
                onClick={() => onShortlistClick?.(candidate)}
                className={isShortlisted 
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"}
                variant={isShortlisted ? "default" : "default"}
              >
                <Star className="h-4 w-4 mr-2" />
                {isShortlisted ? "Remove" : "Shortlist"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative">
        {analysisOpen && candidate.quick_analysis && (
          <div className="mt-2 p-4 bg-muted rounded-md shadow-md animate-fade-in z-20" style={{ position: 'relative' }}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
              onClick={() => setAnalysisOpen(false)}
            >
              <X className="h-4 w-4" /> Close
            </Button>
            <h4 className="font-semibold text-sm mb-2 flex items-center text-primary">
              <BarChart2 className="h-4 w-4 mr-2" />
              Quick Analysis
            </h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-sm">Summary</h5>
                <p className="text-sm text-muted-foreground">{candidate.quick_analysis.summary}</p>
              </div>
              {candidate.quick_analysis.skills_gap.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-yellow-600">Skills Gap</h5>
                  <ul className="text-sm text-yellow-600 list-disc pl-5">
                    {candidate.quick_analysis.skills_gap.map((gap, i) => (
                      <li key={i} className="highlight">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
              {candidate.quick_analysis.red_flags.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-red-600">Red Flags</h5>
                  <ul className="text-sm text-red-600 list-disc pl-5">
                    {candidate.quick_analysis.red_flags.map((flag, i) => (
                      <li key={i} className="highlight">{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {candidate.quick_analysis.highlights.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-green-600">Highlights</h5>
                  <ul className="text-sm text-green-600 list-disc pl-5">
                    {candidate.quick_analysis.highlights.map((highlight, i) => (
                      <li key={i} className="highlight">{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center py-2 text-muted-foreground hover:bg-muted/10"
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? "Hide details" : "View details"}</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {!analysisOpen && (
            <Button
              variant="outline"
              size="sm"
              className="text-primary hover:bg-primary/10"
              onClick={() => setAnalysisOpen(true)}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Quick Analysis
            </Button>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 animate-fade-in">
            <h4 className="font-semibold mb-3 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-primary" />
              Match Breakdown
            </h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Skills Match</span>
                  <span className="text-sm font-medium">{Math.round(candidate.matchBreakdown.skills)}%</span>
                </div>
                <Progress value={Math.round(candidate.matchBreakdown.skills)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Experience Relevance</span>
                  <span className="text-sm font-medium">{Math.round(candidate.matchBreakdown.experience)}%</span>
                </div>
                <Progress value={Math.round(candidate.matchBreakdown.experience)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Education Match</span>
                  <span className="text-sm font-medium">{Math.round(candidate.matchBreakdown.education)}%</span>
                </div>
                <Progress value={Math.round(candidate.matchBreakdown.education)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Industry Relevance</span>
                  <span className="text-sm font-medium">{Math.round(candidate.matchBreakdown.industryRelevance)}%</span>
                </div>
                <Progress value={Math.round(candidate.matchBreakdown.industryRelevance)} className="h-2" />
              </div>
            </div>
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="skills" className="border-b border-border/50">
                <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-primary">Skills</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm inline-block mb-2 mr-2">
                        {skill}
                      </span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="experience" className="border-b border-border/50">
                <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-primary">Experience Timeline</AccordionTrigger>
                <AccordionContent>
                  <div className="relative pl-6 pt-2 pb-2 border-l-2 border-primary/30 ml-2">
                    {candidate.experienceDetails.map((exp, i) => (
                      <div key={i} className="mb-4 relative">
                        <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-primary"></div>
                        <div className="mb-1">
                          <p className="font-medium">{exp.role}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-xs text-muted-foreground">{exp.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="education" className="border-none">
                <AccordionTrigger className="text-sm font-medium hover:no-underline hover:text-primary">Education</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col mt-2">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    {candidate.education.institution && (
                      <p className="ml-7 text-sm">Institution: {candidate.education.institution}</p>
                    )}
                    {candidate.education.degree && (
                      <p className="ml-7 text-sm">Degree: {candidate.education.degree}</p>
                    )}
                    {candidate.education.gpa && (
                      <p className="ml-7 text-sm">GPA: {candidate.education.gpa}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateCard;