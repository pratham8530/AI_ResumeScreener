import { FC, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Trash2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface JDUploaderProps {
  onJdProcessed: (data: any, id: string) => void;
}

const JDUploader: FC<JDUploaderProps> = ({ onJdProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [jdText, setJdText] = useState('');
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

  const clearAll = () => {
    setUploadedFiles([]);
    setJdText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processJd = async () => {
    if (uploadedFiles.length === 0 && !jdText.trim()) {
      toast({
        title: "No input provided",
        description: "Please upload a file or paste a job description.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('file', file);
      });
    }
    if (jdText.trim()) {
      formData.append('text', jdText);
    }

    try {
      const response = await fetch('https://ai-resumescrenner.onrender.com/api/process-jd', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      onJdProcessed(data.jd_data, data.jd_id);
      toast({
        title: "JD Processed",
        description: "Job description successfully analyzed.",
      });
      clearAll();
    } catch (error: any) {
      console.error('Error processing JD:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to process the JD. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Job Description Upload</h2>
        <p className="text-muted-foreground">Upload or paste a job description to start matching</p>
      </div>

      <Card className={`border-2 border-dashed transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload or Paste Job Description</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Drag and drop a file, click to browse, or paste the JD text below
          </p>

          <div className="w-full max-w-md space-y-4">
            <Textarea
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[100px] resize-y"
            />
            <div className="flex items-center justify-between">
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
                multiple={false}
              />
              <p className="text-xs text-muted-foreground">
                Supports: .txt, .pdf, .doc, .docx
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(uploadedFiles.length > 0 || jdText.trim()) && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Input Summary</h3>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="border border-border rounded-md divide-y">
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
            {jdText.trim() && (
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Type className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Pasted Job Description</p>
                    <p className="text-xs text-muted-foreground">{jdText.length} characters</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setJdText('')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={processJd} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Analyze Job Description
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDUploader;