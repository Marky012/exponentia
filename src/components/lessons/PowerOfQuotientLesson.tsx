import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const PowerOfQuotientLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [balanced, setBalanced] = useState(false);

  const steps = [
    {
      title: "Welcome to the Sky Temple of Balance",
      content: "In this temple, the cosmic scales must remain balanced as power flows.",
    },
    {
      title: "The Sacred Scale",
      content: "We have a fraction (5/2) raised to the power of 3",
      visual: "scale",
    },
    {
      title: "Empower Both Sides",
      content: "The power must be distributed equally to maintain balance!",
      visual: "empower",
      action: "interact",
    },
    {
      title: "Balanced Powers",
      content: "When raising a quotient to a power, both numerator and denominator get that power!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleBalance = () => {
    setBalanced(true);
    setTimeout(() => {
      toast.success("Balance maintained! (5/2)³ = 5³/2³");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setBalanced(false);
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
    <div className="space-y-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <h3 className="text-2xl font-orbitron font-bold mb-4">{currentStep.title}</h3>
        <p className="text-lg text-muted-foreground mb-6">{currentStep.content}</p>

        {currentStep.visual && (
          <div className="flex justify-center items-center gap-8 my-8 relative min-h-[250px]">
            {(step === 1 || step === 2) && (
              <div className="relative flex flex-col items-center">
                {/* Scale bar */}
                <motion.div
                  className="w-48 h-2 bg-border rounded-full mb-4"
                  animate={balanced ? { scale: [1, 1.05, 1] } : {}}
                />
                
                {/* Scale platform */}
                <div className="flex items-start justify-center gap-16 relative">
                  {/* Left side (numerator) */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="w-2 h-16 bg-border rounded mb-2"
                      animate={balanced ? { scaleY: 1.2 } : {}}
                    />
                    <motion.div
                      className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center relative"
                      animate={balanced ? { scale: 1.1 } : {}}
                    >
                      <MathText className="text-2xl font-bold">5</MathText>
                      {balanced && (
                        <motion.div
                          className="absolute -top-6 text-xl font-bold text-gem"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <MathText>³</MathText>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Division line */}
                  <div className="absolute left-1/2 top-12 h-20 w-0.5 bg-muted-foreground -translate-x-1/2" />

                  {/* Right side (denominator) */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="w-2 h-16 bg-border rounded mb-2"
                      animate={balanced ? { scaleY: 1.2 } : {}}
                    />
                    <motion.div
                      className="w-24 h-24 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center relative"
                      animate={balanced ? { scale: 1.1 } : {}}
                    >
                      <MathText className="text-2xl font-bold">2</MathText>
                      {balanced && (
                        <motion.div
                          className="absolute -top-6 text-xl font-bold text-gem"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <MathText>³</MathText>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {!balanced && (
                  <motion.div
                    className="absolute -top-8 text-3xl font-bold text-primary"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <MathText>³</MathText>
                  </motion.div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center glow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <MathText className="text-3xl font-bold">5³</MathText>
                </motion.div>
                <div className="h-1 w-24 bg-muted-foreground rounded" />
                <motion.div
                  className="w-32 h-32 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center glow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <MathText className="text-3xl font-bold">2³</MathText>
                </motion.div>
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>(5/2)³ = 5³/2³</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && !balanced ? (
          <Button onClick={handleBalance} size="lg" className="glow">
            Distribute Power
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={balanced && step === 2}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
