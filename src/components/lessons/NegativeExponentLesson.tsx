import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const NegativeExponentLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const steps = [
    {
      title: "Welcome to the Mirror Dimension Portal",
      content: "In this mystical portal, negative powers reveal their reciprocal nature.",
    },
    {
      title: "The Energy Orb",
      content: "We have an orb with 2⁻³ (a negative exponent)",
      visual: "orb",
    },
    {
      title: "Through the Mirror",
      content: "Drag the orb through the mirror portal to reveal its true form!",
      visual: "mirror",
      action: "interact",
    },
    {
      title: "The Reciprocal Revealed",
      content: "A negative exponent means we flip it to become a reciprocal (1 over the positive power)!",
      visual: "result",
    },
  ];

  const currentStep = steps[step];

  const handleFlip = () => {
    setFlipped(true);
    setTimeout(() => {
      toast.success("Power flipped! 2⁻³ = 1/2³");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setFlipped(false);
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
                className="w-32 h-32 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center glow"
              >
                <MathText className="text-3xl font-bold">2⁻³</MathText>
              </motion.div>
            )}

            {step === 2 && (
              <div className="relative w-full flex items-center justify-center">
                {/* Mirror portal line */}
                <div className="absolute left-1/2 h-48 w-1 bg-gradient-to-b from-primary/0 via-primary to-primary/0 -translate-x-1/2 z-10" />
                
                {/* Original expression - hide after flip */}
                {!flipped && (
                  <motion.div
                    className="w-28 h-28 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center absolute"
                    animate={{ x: -100 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <MathText className="text-2xl font-bold">2⁻³</MathText>
                  </motion.div>
                )}

                {/* Flipping animation - show during transition */}
                {flipped && (
                  <>
                    {/* Orb moving through portal and fading */}
                    <motion.div
                      className="w-28 h-28 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center absolute"
                      initial={{ x: -100, opacity: 1 }}
                      animate={{ x: 0, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <MathText className="text-2xl font-bold">2⁻³</MathText>
                    </motion.div>

                    {/* Result appearing on the other side */}
                    <motion.div
                      className="w-28 h-28 rounded-full bg-gem/20 border-4 border-gem flex items-center justify-center absolute"
                      initial={{ x: 0, scale: 0, opacity: 0 }}
                      animate={{ x: 100, scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <MathText className="text-xl font-bold">1/2³</MathText>
                    </motion.div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <motion.div
                className="w-40 h-40 rounded-full bg-gem/20 border-4 border-gem flex items-center justify-center glow-strong"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <MathText className="text-3xl font-bold">1/2³</MathText>
              </motion.div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {step === 3 && (
            <MathDisplay>2⁻³ = 1/2³ = 1/8</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && !flipped ? (
          <Button onClick={handleFlip} size="lg" className="glow">
            Flip Through Mirror
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={flipped && step === 2}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
