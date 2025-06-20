import { FC, useState } from 'react';
import { Edit2, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

interface JDPreviewCardProps {
  jobDescription: JobDescription;
  onEdit?: (jobDescription: JobDescription) => void;
  onReset?: () => void; // New prop to handle reset
}

const JDPreviewCard: FC<JDPreviewCardProps> = ({ jobDescription, onEdit, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(jobDescription.summary);

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onEdit) {
      onEdit({
        ...jobDescription,
        summary: editedSummary
      });
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const renderHighlightedText = (text: string) => {
    let highlightedText = text;
    jobDescription.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, match => `<span class="highlight-keyword">${match}</span>`);
    });
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="animate-scale-in">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              {jobDescription.title}
            </CardTitle>
            <div className="flex space-x-2">
              {isEditing ? (
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleReset}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="p-4 bg-muted/20 rounded-md">
              {isEditing ? (
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full h-32 p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                renderHighlightedText(jobDescription.summary)
              )}
            </TabsContent>

            <TabsContent value="skills">
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-medium mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jobDescription.skills.map((skillObj, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {skillObj.skill}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="responsibilities">
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-medium mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {jobDescription.responsibilities.map((responsibility, index) => (
                    <li key={index}>{renderHighlightedText(responsibility)}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="requirements">
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-medium mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {jobDescription.requirements.map((requirement, index) => (
                    <li key={index}>{renderHighlightedText(requirement)}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="original">
              <div className="p-4 bg-muted/20 rounded-md max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {jobDescription.originalText}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Extracted Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-muted/20 rounded-md">
            <div className="flex flex-wrap gap-2">
              {jobDescription.keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JDPreviewCard;