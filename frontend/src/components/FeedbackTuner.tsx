
import { FC, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

interface WeightItem {
  name: string;
  weight: number;
  category: 'skills' | 'experience' | 'education' | 'other';
}

interface FeedbackTunerProps {
  weights: WeightItem[];
  jobTitle: string;
  onWeightsChanged: (newWeights: WeightItem[]) => void;
}

const FeedbackTuner: FC<FeedbackTunerProps> = ({ 
  weights: initialWeights, 
  jobTitle,
  onWeightsChanged
}) => {
  const [weights, setWeights] = useState<WeightItem[]>(initialWeights);
  const { toast } = useToast();

  const handleWeightChange = (index: number, newValue: number[]) => {
    const newWeights = [...weights];
    newWeights[index].weight = newValue[0];
    setWeights(newWeights);
  };

  const resetWeights = () => {
    setWeights(initialWeights);
    toast({
      title: "Weights Reset",
      description: "All weights have been reset to their default values.",
    });
  };

  const saveWeights = () => {
    onWeightsChanged(weights);
    toast({
      title: "Preferences Saved",
      description: "Your customized weights have been applied to the matching algorithm.",
    });
  };

  const getSkillsByCategory = (category: 'skills' | 'experience' | 'education' | 'other') => {
    return weights.filter(w => w.category === category);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Feedback Tuner</h2>
        <p className="text-muted-foreground">
          Customize how skills and experience are weighted for {jobTitle}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Skills Importance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {getSkillsByCategory('skills').map((item, index) => (
            <div key={`skill-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.weight}%</span>
              </div>
              <Slider
                value={[item.weight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(newValue) => handleWeightChange(
                  weights.findIndex(w => w.name === item.name && w.category === 'skills'),
                  newValue
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Experience Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {getSkillsByCategory('experience').map((item, index) => (
            <div key={`exp-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.weight}%</span>
              </div>
              <Slider
                value={[item.weight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(newValue) => handleWeightChange(
                  weights.findIndex(w => w.name === item.name && w.category === 'experience'),
                  newValue
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Education & Other Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...getSkillsByCategory('education'), ...getSkillsByCategory('other')].map((item, index) => (
            <div key={`other-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.weight}%</span>
              </div>
              <Slider
                value={[item.weight]}
                min={0}
                max={100}
                step={5}
                onValueChange={(newValue) => handleWeightChange(
                  weights.findIndex(w => w.name === item.name && w.category === item.category),
                  newValue
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={resetWeights}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
        <Button onClick={saveWeights}>
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </div>
      
      <div className="mt-6 bg-muted/40 rounded-md p-4 text-sm">
        <h4 className="font-medium flex items-center mb-2">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-primary">i</span>
          </div>
          How it works
        </h4>
        <p className="text-muted-foreground">
          The feedback tuner allows you to adjust how different skills and experiences are weighted in the candidate matching process. 
          Your preferences will be saved for this job and will automatically re-rank candidates based on your priorities.
        </p>
      </div>
    </div>
  );
};

export default FeedbackTuner;
