
import { FC, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface CVUploaderProps {
  onCVsProcessed: (data: any[]) => void;
}

const CVUploader: FC<CVUploaderProps> = ({ onCVsProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'application/pdf' || 
      file.type.includes('document')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only text, PDF, or document files are supported.",
        variant: "destructive"
      });
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processResumes = () => {
    setIsProcessing(true);
    
    // Simulate API call to process CVs
    setTimeout(() => {
      // Example processed data - normally would be returned from backend
      const processedData = [
        {
          id: 1,
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          phone: "+1 (555) 123-4567",
          experience: 6,
          education: "M.S. Computer Science, Stanford University",
          skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Redux", "Node.js", "Git"],
          experienceDetails: [
            { company: "Tech Solutions Inc.", role: "Senior Frontend Developer", duration: "2020-Present" },
            { company: "WebDev Co.", role: "Frontend Developer", duration: "2017-2020" }
          ],
          matchScore: 92,
          matchBreakdown: {
            skills: 95,
            experience: 90,
            education: 85,
            industryRelevance: 88
          }
        },
        {
          id: 2,
          name: "Jamie Smith",
          email: "jamie.smith@example.com",
          phone: "+1 (555) 987-6543",
          experience: 4,
          education: "B.S. Software Engineering, MIT",
          skills: ["JavaScript", "React", "Angular", "CSS", "HTML", "Git", "Node.js"],
          experienceDetails: [
            { company: "App Innovators", role: "Frontend Developer", duration: "2019-Present" },
            { company: "Digital Agency", role: "Web Developer", duration: "2018-2019" }
          ],
          matchScore: 85,
          matchBreakdown: {
            skills: 83,
            experience: 75,
            education: 90,
            industryRelevance: 92
          }
        },
        {
          id: 3,
          name: "Taylor Rodriguez",
          email: "taylor.r@example.com",
          phone: "+1 (555) 456-7890",
          experience: 8,
          education: "B.A. Computer Science, Berkeley",
          skills: ["JavaScript", "jQuery", "CSS", "HTML", "Bootstrap", "PHP", "MySQL"],
          experienceDetails: [
            { company: "WebCraft", role: "Lead Developer", duration: "2018-Present" },
            { company: "TechSolutions", role: "Senior Web Developer", duration: "2015-2018" },
            { company: "CreativeWeb", role: "Web Developer", duration: "2013-2015" }
          ],
          matchScore: 68,
          matchBreakdown: {
            skills: 65,
            experience: 85,
            education: 70,
            industryRelevance: 60
          }
        }
      ];
      
      onCVsProcessed(processedData);
      setIsProcessing(false);
      toast({
        title: "CVs Processed",
        description: `Successfully analyzed ${uploadedFiles.length} resumes.`,
      });
    }, 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Candidate Matching</h2>
        <p className="text-muted-foreground">Upload candidate resumes to find the best matches</p>
      </div>
      
      <Card className={`border-2 border-dashed transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Candidate Resumes</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Drag and drop your files here, or click the button below to browse files
          </p>
          
          <div className="flex items-center gap-4">
            <Button onClick={triggerFileInput}>
              <FileText className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".txt,.pdf,.doc,.docx" 
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            
            <div className="text-xs text-muted-foreground">
              Supported formats: .txt, .pdf, .doc
            </div>
          </div>
        </CardContent>
      </Card>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Uploaded Resumes ({uploadedFiles.length})</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFiles}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto border border-border rounded-md divide-y">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={processResumes} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing {uploadedFiles.length} files...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Analyze Candidates
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-muted/40 rounded-md p-4 text-sm">
        <h4 className="font-medium flex items-center mb-2">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">i</span>
          </div>
          How it works
        </h4>
        <p className="text-muted-foreground">
          The Candidate Parsing Agent extracts key information from resumes and employs context-aware matching algorithms to score candidates against the job description. This process uses Ollama to understand skills, experience, and qualifications in context.
        </p>
      </div>
    </div>
  );
};

export default CVUploader;
