import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const PowerOfPowerLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [shellsCracked, setShellsCracked] = useState(false);
  const [copies, setCopies] = useState(1);

  const steps = [
    {
      title: "Welcome to the Echo Temple",
      content: "This ancient temple echoes and multiplies power through sacred shells.",
    },
    {
      title: "The Layered Shell",
      content: "We have a shell containing (2³), wrapped in 4 layers of power",
      visual: "shell",
    },
    {
      title: "Crack the Shell",
      content: "Each layer creates copies of what's inside!",
      visual: "crack",
      action: "interact",
    },
    {
      title: "Recompress the Power",
      content: "When raising a power to another power, we MULTIPLY the exponents!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleCrack = () => {
    setShellsCracked(true);
    setTimeout(() => {
      setCopies(4);
      toast.success("Shell cracked! 4 copies revealed!");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setShellsCracked(false);
          setCopies(1);
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
              <motion.div className="relative">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-4 border-primary/40"
                    style={{
                      width: 160 - i * 20,
                      height: 160 - i * 20,
                      margin: 'auto',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))}
                <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center relative z-10">
                  <MathText className="text-2xl font-bold">2³</MathText>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <div className="relative">
                {!shellsCracked ? (
                  <motion.div className="relative">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-4 border-primary/40"
                        style={{
                          width: 160 - i * 20,
                          height: 160 - i * 20,
                          margin: 'auto',
                        }}
                        animate={{ rotate: shellsCracked ? [0, 180] : 0 }}
                      />
                    ))}
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center relative z-10">
                      <MathText className="text-2xl font-bold">2³</MathText>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: copies }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <MathText className="text-xl font-bold">2³</MathText>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <motion.div
                className="w-40 h-40 rounded-full bg-gem/20 border-4 border-gem flex items-center justify-center glow-strong"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <MathText className="text-4xl font-bold">2¹²</MathText>
              </motion.div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>(2³)⁴ = 2³ˣ⁴ = 2¹²</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && !shellsCracked ? (
          <Button onClick={handleCrack} size="lg" className="glow">
            Crack the Shell
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={shellsCracked}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
