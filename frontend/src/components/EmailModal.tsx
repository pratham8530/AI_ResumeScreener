
import { FC, useState, useEffect } from 'react';
import { Check, Copy, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

interface Candidate {
  id: number;
  name: string;
  email: string;
  matchScore: number;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  jobTitle: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const EmailModal: FC<EmailModalProps> = ({ isOpen, onClose, candidate, jobTitle }) => {
  const [emailContent, setEmailContent] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const { toast } = useToast();
  
  const templates: EmailTemplate[] = [
    {
      id: 'default',
      name: 'Standard Interview Invitation',
      subject: `Interview Invitation: ${jobTitle} Position`,
      content: `Dear ${candidate?.name},

I hope this email finds you well. Thank you for your application for the ${jobTitle} position at Accenture.

We were impressed with your background and qualifications, and we would like to invite you to an interview to discuss your application further. Your skills and experience appear to be a strong match for our requirements (${candidate?.matchScore}% match with our criteria).

Could we schedule an interview next week? Please let me know your availability.

I look forward to speaking with you soon.

Best regards,
Recruitment Team
Accenture`
    },
    {
      id: 'technical',
      name: 'Technical Assessment Invitation',
      subject: `Technical Assessment for ${jobTitle} Role`,
      content: `Dear ${candidate?.name},

Thank you for applying to the ${jobTitle} position at Accenture. We've reviewed your application and are impressed with your qualifications.

As the next step in our hiring process, we would like to invite you to complete a technical assessment to better evaluate your technical skills relevant to this role. Your profile shows a strong match (${candidate?.matchScore}%) with our requirements.

The assessment will take approximately 90 minutes and will focus on practical problems similar to what you might encounter in this position. You'll receive a separate email with instructions and access to the assessment platform.

Please complete the assessment within the next 5 days. If you have any questions or need accommodations, don't hesitate to reach out.

Best regards,
Technical Hiring Team
Accenture`
    },
    {
      id: 'followup',
      name: 'Interview Follow-up',
      subject: `Next Steps: ${jobTitle} Position at Accenture`,
      content: `Dear ${candidate?.name},

Thank you for taking the time to interview for the ${jobTitle} position at Accenture. We appreciate your interest in joining our team.

We were impressed with your experience and the skills you've demonstrated throughout our selection process. Your profile shows a strong match (${candidate?.matchScore}%) with what we're looking for.

I'm happy to inform you that we would like to move forward with your application. Our team would like to schedule a final interview with our department director next week.

Could you please provide your availability for next Monday through Wednesday between 10 AM and 4 PM? We'll do our best to accommodate your schedule.

Looking forward to speaking with you again soon.

Best regards,
Recruitment Team
Accenture`
    },
    {
      id: 'offer',
      name: 'Job Offer',
      subject: `Job Offer: ${jobTitle} at Accenture`,
      content: `Dear ${candidate?.name},

I am delighted to offer you the position of ${jobTitle} at Accenture. Your impressive background, skills, and interview performance (${candidate?.matchScore}% match score) have convinced us that you would be a valuable addition to our team.

Attached to this email, you will find the formal offer letter with details regarding:
- Compensation and benefits package
- Start date and onboarding process
- Additional employment terms and conditions

To accept this offer, please sign the attached documents and return them to us by [DATE]. Once we receive your acceptance, our HR team will contact you with next steps for the onboarding process.

If you have any questions about the offer or need any clarification, please don't hesitate to contact me directly.

Congratulations again! We are excited about the possibility of you joining Accenture and look forward to your positive response.

Best regards,
Recruitment Team
Accenture`
    }
  ];

  // Generate email content when candidate or template changes
  useEffect(() => {
    if (candidate) {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      if (selectedTemplateData) {
        // Replace placeholders with actual values
        let content = selectedTemplateData.content
          .replace('${candidate?.name}', candidate.name)
          .replace('${jobTitle}', jobTitle)
          .replace('${candidate?.matchScore}', candidate.matchScore.toString());
        
        setEmailContent(content);
        setEmailSubject(selectedTemplateData.subject);
      }
    }
  }, [candidate, jobTitle, selectedTemplate]);

  const handleCopyToClipboard = () => {
    if (emailContent) {
      navigator.clipboard.writeText(emailContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Email content has been copied to clipboard",
        duration: 3000,
      });
    }
  };

  const handleSendEmail = () => {
    // Simulate sending email
    toast({
      title: "Email sent successfully",
      description: `An email has been sent to ${candidate?.name} at ${candidate?.email}`,
    });
    onClose();
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Email to {candidate.name}</DialogTitle>
          <DialogDescription>
            Personalized communication for the {jobTitle} position.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Email Template</label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">To:</span> {candidate.email}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Subject:</span> {emailSubject}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="w-full h-64 p-4 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2" 
              onClick={handleCopyToClipboard}
            >
              {isCopied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between mt-4 items-center">
          <div className="text-xs text-muted-foreground">
            AI-generated email based on candidate profile
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              Send Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
