
import { FC } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface StepTimelineProps {
  steps: Step[];
}

const StepTimeline: FC<StepTimelineProps> = ({ steps }) => {
  return (
    <div className="px-6 py-4 bg-muted/30 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Line before */}
              {index > 0 && (
                <div 
                  className={cn(
                    "h-0.5 flex-1",
                    step.status === "upcoming" 
                      ? "bg-muted-foreground/30" 
                      : step.status === "current"
                        ? "bg-gradient-to-r from-primary to-muted-foreground/30"
                        : "bg-primary"
                  )}
                />
              )}
              
              {/* Step indicator */}
              <div 
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-white flex-shrink-0",
                  step.status === "complete"
                    ? "bg-primary"
                    : step.status === "current"
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-muted-foreground/40"
                )}
              >
                {step.status === "complete" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              
              {/* Line after */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-0.5 flex-1",
                    step.status === "upcoming" || steps[index + 1].status === "upcoming"
                      ? "bg-muted-foreground/30" 
                      : step.status === "complete" && steps[index + 1].status === "current"
                        ? "bg-gradient-to-r from-primary to-muted-foreground/30"
                        : "bg-primary"
                  )}
                />
              )}
            </div>
            
            <div className="mt-2 text-center">
              <p className={cn(
                "font-medium",
                step.status === "current" ? "text-primary" : 
                step.status === "complete" ? "text-foreground" :
                "text-muted-foreground"
              )}>
                {step.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[120px] mx-auto">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepTimeline;
