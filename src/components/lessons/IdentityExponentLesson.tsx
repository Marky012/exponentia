import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const IdentityExponentLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const steps = [
    {
      title: "Welcome to the Origin Crystal Chamber",
      content: "In this primordial chamber, all power originates from its purest form.",
    },
    {
      title: "The Origin Crystal",
      content: "We have a crystal containing pure energy: 7",
      visual: "crystal",
    },
    {
      title: "The Single Layer",
      content: "When raised to the power of 1, the essence remains unchanged!",
      visual: "reveal",
      action: "interact",
    },
    {
      title: "The Identity Revealed",
      content: "Any base raised to the power of 1 is simply itself - the identity property!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => {
      toast.success("Identity revealed! 7¹ = 7");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setRevealed(false);
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
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-gem/30 border-4 border-primary flex items-center justify-center glow-strong">
                  <MathText className="text-4xl font-bold">7</MathText>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-gem/40"
                  style={{ width: '120%', height: '120%', margin: '-10%' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            )}

            {step === 2 && (
              <div className="relative">
                <motion.div
                  className="absolute -top-12 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MathText className="text-3xl font-bold text-primary">¹</MathText>
                </motion.div>
                
                <motion.div
                  className="relative"
                  animate={revealed ? { scale: [1, 1.2, 1] } : { rotate: 360 }}
                  transition={revealed ? { duration: 1 } : { duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-gem/30 border-4 border-primary flex items-center justify-center glow-strong">
                    <MathText className="text-4xl font-bold">7</MathText>
                  </div>
                  {!revealed && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-gem/40"
                      style={{ width: '120%', height: '120%', margin: '-10%' }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>

                {revealed && (
                  <motion.div
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-2xl font-bold text-gem"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    = 7
                  </motion.div>
                )}
              </div>
            )}

            {step === 3 && (
              <motion.div
                className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-gem/30 border-4 border-gem flex items-center justify-center glow-strong"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 1 }}
              >
                <MathText className="text-5xl font-bold">7</MathText>
              </motion.div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>7¹ = 7</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && !revealed ? (
          <Button onClick={handleReveal} size="lg" className="glow">
            Apply Power of One
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={revealed && step === 2}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
