import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const ZeroExponentLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [layersRemoved, setLayersRemoved] = useState(0);

  const steps = [
    {
      title: "Welcome to the Silent Tower",
      content: "In this tower of stillness, all things return to unity.",
    },
    {
      title: "The Energy Sphere",
      content: "We have a sphere of 5³ with three layers of power",
      visual: "layers",
    },
    {
      title: "Remove All Layers",
      content: "Watch as we peel away all the energy layers...",
      visual: "removing",
      action: "interact",
    },
    {
      title: "The Unity Spark",
      content: "When any base is raised to the power of 0, only unity remains!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleRemoveLayers = () => {
    const interval = setInterval(() => {
      setLayersRemoved((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            toast.success("All layers removed! 5⁰ = 1");
            setTimeout(() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
                setLayersRemoved(0);
              } else {
                onComplete();
              }
            }, 1500);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
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
            {(step === 1 || step === 2) && (
              <div className="relative">
                {[2, 1, 0].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-4 border-primary/40"
                    style={{
                      width: 160 - i * 30,
                      height: 160 - i * 30,
                      margin: 'auto',
                    }}
                    animate={{
                      opacity: layersRemoved > i ? 0 : 1,
                      scale: layersRemoved > i ? 1.5 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
                <motion.div
                  className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center relative z-10"
                  animate={{
                    scale: layersRemoved >= 3 ? 0 : 1,
                    opacity: layersRemoved >= 3 ? 0 : 1,
                  }}
                >
                  <MathText className="text-2xl font-bold">5</MathText>
                </motion.div>
                {layersRemoved >= 3 && (
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gem/40 border-4 border-gem flex items-center justify-center absolute inset-0 m-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <MathText className="text-3xl font-bold">1</MathText>
                  </motion.div>
                )}
              </div>
            )}

            {step === 3 && (
              <motion.div
                className="w-32 h-32 rounded-full bg-gem/20 border-4 border-gem flex items-center justify-center glow-strong"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <MathText className="text-5xl font-bold">1</MathText>
              </motion.div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>5⁰ = 1</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && layersRemoved === 0 ? (
          <Button onClick={handleRemoveLayers} size="lg" className="glow">
            Remove All Layers
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={layersRemoved > 0 && layersRemoved < 3}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
