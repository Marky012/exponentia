import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const QuotientOfPowersLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [removedBlocks, setRemovedBlocks] = useState<number[]>([]);

  const steps = [
    {
      title: "Welcome to the Frost Divide Cavern",
      content: "In this icy cavern, we can split energy towers by removing matching blocks.",
    },
    {
      title: "The Energy Tower",
      content: "We have a tower of 3⁵ (five blocks of base 3)",
      visual: "numerator",
    },
    {
      title: "Division by 3²",
      content: "We need to divide by 3² (two blocks of base 3)",
      visual: "both",
    },
    {
      title: "Cancel Matching Blocks",
      content: "When dividing powers with the same base, we SUBTRACT the exponents!",
      visual: "result",
      action: "interact",
    },
  ];

  const currentStep = steps[step];

  const handleRemoveBlocks = () => {
    setRemovedBlocks([0, 1]);
    setTimeout(() => {
      toast.success("Blocks removed! 3⁵ ÷ 3² = 3³");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setRemovedBlocks([]);
        } else {
          onComplete();
        }
      }, 1500);
    }, 1000);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <h3 className="text-lg sm:text-xl md:text-2xl font-orbitron font-bold mb-2 sm:mb-4">{currentStep.title}</h3>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6">{currentStep.content}</p>

        {currentStep.visual && (
          <div className="flex justify-center items-center gap-4 sm:gap-8 my-4 sm:my-8 relative min-h-[150px] sm:min-h-[300px]">
            {step < 3 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col gap-2">
                  {[4, 3, 2, 1, 0].map((i) => (
                    <motion.div
                      key={i}
                      className="w-14 h-9 sm:w-20 sm:h-12 bg-primary/30 border-2 sm:border-4 border-primary rounded flex items-center justify-center"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <MathText className="text-sm sm:text-lg font-bold">3</MathText>
                    </motion.div>
                  ))}
                </div>
                {step === 2 && (
                  <>
                    <div className="text-xl sm:text-2xl font-bold text-muted-foreground">÷</div>
                    <div className="flex flex-col gap-2">
                      {[1, 0].map((i) => (
                        <motion.div
                          key={i}
                          className="w-14 h-9 sm:w-20 sm:h-12 bg-secondary/30 border-2 sm:border-4 border-secondary rounded flex items-center justify-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <MathText className="text-sm sm:text-lg font-bold">3</MathText>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col gap-2">
                  {[4, 3, 2, 1, 0].map((i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-14 h-9 sm:w-20 sm:h-12 border-2 sm:border-4 rounded flex items-center justify-center",
                        removedBlocks.includes(i)
                          ? "bg-muted/20 border-muted opacity-30"
                          : i < 2
                          ? "bg-primary/30 border-primary"
                          : "bg-gem/30 border-gem"
                      )}
                      animate={
                        removedBlocks.includes(i)
                          ? { scale: 0.8, opacity: 0.3 }
                          : i >= 2 && removedBlocks.length > 0
                          ? { y: 48 }
                          : {}
                      }
                    >
                      <MathText className="text-sm sm:text-lg font-bold">3</MathText>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-3 sm:p-4">
          {step === 3 && (
            <MathDisplay>3⁵ ÷ 3² = 3⁵⁻² = 3³</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-2 sm:gap-4">
        {currentStep.action === "interact" && removedBlocks.length === 0 ? (
          <Button onClick={handleRemoveBlocks} size="lg" className="glow text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6">
            Remove Matching Blocks
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={removedBlocks.length > 0} className="text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6">
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
