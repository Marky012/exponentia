import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathDisplay, MathText } from '@/utils/mathRenderer';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Interactive learning content for Product of Powers
const ProductOfPowersLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selectedOrbs, setSelectedOrbs] = useState<number[]>([]);

  const steps = [
    {
      title: "Welcome to the Fusion Forge",
      content: "This mystical forge can combine energy orbs with the same base.",
      action: null,
    },
    {
      title: "The First Orb",
      content: "Here we have an orb containing 2³ (2×2×2 = 8 units of power)",
      visual: "2³",
      action: null,
    },
    {
      title: "The Second Orb",
      content: "And here's another orb with 2² (2×2 = 4 units of power)",
      visual: "2²",
      action: null,
    },
    {
      title: "Fusion Time!",
      content: "When we fuse orbs with the same base, we ADD the exponents!",
      visual: "2³ × 2² = 2³⁺² = 2⁵",
      action: "interact",
    },
  ];

  const currentStep = steps[step];

  const handleFusion = () => {
    setSelectedOrbs([0, 1]);
    setTimeout(() => {
      toast.success("Fusion successful! The orbs combined into 2⁵");
      setTimeout(() => {
        if (step < steps.length - 1) {
          setStep(step + 1);
          setSelectedOrbs([]);
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
            {step < 3 ? (
              <motion.div
                className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center glow"
                animate={{
                  scale: selectedOrbs.includes(step - 1) ? [1, 1.2, 0.8] : 1,
                }}
              >
                <MathText className="text-3xl font-bold">{currentStep.visual}</MathText>
              </motion.div>
            ) : (
              <div className="relative flex items-center justify-center w-full">
                <motion.div
                  className={cn(
                    "w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center absolute",
                    selectedOrbs.includes(0) && "opacity-50"
                  )}
                  animate={selectedOrbs.includes(0) ? { x: 60, scale: 0.5 } : { x: -80 }}
                >
                  <MathText className="text-2xl font-bold">2³</MathText>
                </motion.div>

                <motion.div
                  className={cn(
                    "w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center absolute",
                    selectedOrbs.includes(1) && "opacity-50"
                  )}
                  animate={selectedOrbs.includes(1) ? { x: -60, scale: 0.5 } : { x: 80 }}
                >
                  <MathText className="text-2xl font-bold">2²</MathText>
                </motion.div>

                {selectedOrbs.length === 2 && (
                  <motion.div
                    className="w-40 h-40 rounded-full bg-gem/20 border-4 border-gem flex items-center justify-center glow-strong absolute"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <MathText className="text-4xl font-bold">2⁵</MathText>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/30 border border-primary/20 rounded-lg p-4">
          {currentStep.visual && step === 3 && (
            <MathDisplay>{currentStep.visual}</MathDisplay>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        {currentStep.action === "interact" && selectedOrbs.length === 0 ? (
          <Button onClick={handleFusion} size="lg" className="glow">
            Fuse the Orbs
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" disabled={selectedOrbs.length > 0}>
            {step < steps.length - 1 ? "Continue" : "Complete Lesson"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

const LawLearn = () => {
  const { lawId } = useParams();
  const navigate = useNavigate();
  const { laws, completeLaw } = useGameStore();
  
  const law = laws.find((l) => l.id === lawId);

  if (!law) {
    navigate('/laws');
    return null;
  }

  const handleComplete = () => {
    completeLaw(law.id);
    toast.success(`${law.name} lesson completed!`);
    navigate('/laws');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/laws')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-glow">{law.name}</h1>
            <p className="text-muted-foreground">{law.scene}</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          {/* Law Formula */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6 mb-8 text-center">
            <MathDisplay className="text-3xl">{law.formula}</MathDisplay>
          </div>

          {/* Elexia's Guidance */}
          <div className="flex gap-4 mb-8 bg-muted/20 border border-border rounded-lg p-4">
            <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-primary mb-1">Elexia's Hint:</p>
              <p className="text-sm text-muted-foreground">
                When multiplying powers with the same base, keep the base and add the exponents together!
              </p>
            </div>
          </div>

          {/* Interactive Lesson */}
          {law.id === 'product' && <ProductOfPowersLesson onComplete={handleComplete} />}
          
          {/* Placeholder for other laws */}
          {law.id !== 'product' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">
                Interactive lesson for {law.name} coming soon!
              </p>
              <Button onClick={handleComplete} size="lg">
                Mark as Complete
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LawLearn;
