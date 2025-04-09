
import { FC, useState } from 'react';
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FeedbackTuner from './FeedbackTuner';

interface FeedbackTunerButtonProps {
  weights: {
    name: string;
    weight: number;
    category: 'skills' | 'experience' | 'education' | 'other';
  }[];
  jobTitle: string;
  onWeightsChanged: (newWeights: {
    name: string;
    weight: number;
    category: 'skills' | 'experience' | 'education' | 'other';
  }[]) => void;
}

const FeedbackTunerButton: FC<FeedbackTunerButtonProps> = ({ 
  weights, 
  jobTitle, 
  onWeightsChanged 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Sliders className="h-4 w-4" />
          Adjust Matching Criteria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fine-tune Matching Criteria</DialogTitle>
          <DialogDescription>
            Adjust how each skill and experience factor is weighted for {jobTitle}
          </DialogDescription>
        </DialogHeader>
        <FeedbackTuner 
          weights={weights}
          jobTitle={jobTitle}
          onWeightsChanged={(newWeights) => {
            onWeightsChanged(newWeights);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackTunerButton;
