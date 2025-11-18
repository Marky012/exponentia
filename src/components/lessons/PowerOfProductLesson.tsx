import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const PowerOfProductLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [split, setSplit] = useState(false);

  const steps = [
    {
      title: "Welcome to the Twin Core Nexus",
      content: "In this nexus, bonded cores can be separated and empowered individually.",
    },
    {
      title: "The Fused Core",
      content: "We have a fused core (2×3) raised to the power of 4",
      visual: "fused",
    },
    {
      title: "Split the Cores",
      content: "Watch as we separate the cores and distribute the power!",
      visual: "split",
      action: "interact",
    },
    {
      title: "Individual Powers",
      content: "When raising a product to a power, each factor gets raised to that power!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleSplit = () => {
    setSplit(true);
    setTimeout(() => {
      toast.success("Cores split and powered! (2×3)⁴ = 2⁴ × 3⁴");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setSplit(false);
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
          <div className="flex justify-center items-center gap-8 my-8 relative min-h-[200px]">
            {step === 1 && (
              <motion.div
                className="w-40 h-40 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center glow relative"
              >
                <MathText className="text-3xl font-bold">(2×3)⁴</MathText>
                <div className="absolute inset-0 rounded-full border-2 border-secondary/40 animate-pulse" />
              </motion.div>
            )}

            {step === 2 && (
              <div className="relative w-full flex items-center justify-center">
                {!split ? (
                  <motion.div
                    className="w-40 h-40 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center glow relative"
                  >
                    <MathText className="text-3xl font-bold">(2×3)⁴</MathText>
                    <div className="absolute inset-0 rounded-full border-2 border-secondary/40 animate-pulse" />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center absolute"
                      initial={{ x: 0 }}
                      animate={{ x: -80 }}
                    >
                      <MathText className="text-2xl font-bold">2</MathText>
                    </motion.div>
                    <motion.div
                      className="w-32 h-32 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center absolute"
                      initial={{ x: 0 }}
                      animate={{ x: 80 }}
                    >
                      <MathText className="text-2xl font-bold">3</MathText>
                    </motion.div>
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-gem"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <MathText>⁴</MathText>
                    </motion.div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-28 h-28 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center glow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <MathText className="text-2xl font-bold">2⁴</MathText>
                </motion.div>
                <div className="text-3xl font-bold text-muted-foreground">×</div>
                <motion.div
                  className="w-28 h-28 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center glow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <MathText className="text-2xl font-bold">3⁴</MathText>
                </motion.div>
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>(2×3)⁴ = 2⁴ × 3⁴</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && !split ? (
          <Button onClick={handleSplit} size="lg" className="glow">
            Split the Cores
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={split && step === 2}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
