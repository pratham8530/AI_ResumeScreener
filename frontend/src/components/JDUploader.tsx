import { FC, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface JDUploaderProps {
  onJdProcessed: (data: any) => void;
}

interface ProcessedData {
  title: string;
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
  originalText: string;
}

const JDUploader: FC<JDUploaderProps> = ({ onJdProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null); // New state for displaying data
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: 'Unsupported file format',
        description: 'Please upload a .txt, .pdf, .doc, or .docx file.',
        variant: 'destructive',
      });
      return;
    }
    setUploadedFile(file);
    setProcessedData(null); // Reset processed data when a new file is uploaded
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setProcessedData(null); // Clear processed data too
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processJobDescription = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      console.log('Sending request to backend...');
      const response = await fetch('http://127.0.0.1:8000/process-jd/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data: ProcessedData = await response.json();
      console.log('Received processed data:', data);

      setProcessedData(data); // Store data to display it
      onJdProcessed(data); // Pass data to parent component

      toast({
        title: 'Job Description Processed',
        description: 'The AI has successfully analyzed your job description.',
      });
    } catch (error: any) {
      console.error('Error processing job description:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process the job description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Job Description Analysis</h2>
        <p className="text-muted-foreground">Upload a job description to get started</p>
      </div>

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Job Description</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Drag and drop your file here, or click the button below to browse files
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
              />
              <div className="text-xs text-muted-foreground">
                Supported formats: .txt, .pdf, .doc, .docx
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">{uploadedFile.name}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={clearUploadedFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={clearUploadedFile}>
              Clear
            </Button>
            <Button onClick={processJobDescription} disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>

          {/* Display Processed Data */}
          {processedData && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Title</h4>
                    <p>{processedData.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Summary</h4>
                    <p>{processedData.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Skills</h4>
                    <ul className="list-disc pl-5">
                      {processedData.skills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Responsibilities</h4>
                    <ul className="list-disc pl-5">
                      {processedData.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Requirements</h4>
                    <ul className="list-disc pl-5">
                      {processedData.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Keywords</h4>
                    <ul className="list-disc pl-5">
                      {processedData.keywords.map((keyword, index) => (
                        <li key={index}>{keyword}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
          The JD Summarizer Agent uses Google’s Gemini model to analyze your job description
          and extract key information like required skills, responsibilities, and qualifications.
          This helps streamline the recruitment process.
        </p>
      </div>
    </div>
  );
};

export default JDUploader;