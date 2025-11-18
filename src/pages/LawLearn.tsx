import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { ProductOfPowersLesson } from '@/components/lessons/ProductOfPowersLesson';
import { QuotientOfPowersLesson } from '@/components/lessons/QuotientOfPowersLesson';
import { PowerOfPowerLesson } from '@/components/lessons/PowerOfPowerLesson';
import { ZeroExponentLesson } from '@/components/lessons/ZeroExponentLesson';
import { NegativeExponentLesson } from '@/components/lessons/NegativeExponentLesson';
import { PowerOfProductLesson } from '@/components/lessons/PowerOfProductLesson';
import { PowerOfQuotientLesson } from '@/components/lessons/PowerOfQuotientLesson';
import { IdentityExponentLesson } from '@/components/lessons/IdentityExponentLesson';

const lawHints: Record<string, string> = {
  product: "When multiplying powers with the same base, keep the base and add the exponents together!",
  quotient: "When dividing powers with the same base, keep the base and subtract the exponents!",
  power: "When raising a power to another power, keep the base and multiply the exponents!",
  zero: "Any non-zero base raised to the power of 0 equals 1 - it's the unity property!",
  negative: "A negative exponent means 'flip it' - move the base to the denominator and make the exponent positive!",
  'product-power': "When raising a product to a power, distribute that power to each factor in the product!",
  'quotient-power': "When raising a quotient to a power, distribute that power to both the numerator and denominator!",
  identity: "Any base raised to the power of 1 is simply itself - the identity property!",
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
                {lawHints[law.id]}
              </p>
            </div>
          </div>

          {/* Interactive Lessons */}
          {law.id === 'product' && <ProductOfPowersLesson onComplete={handleComplete} />}
          {law.id === 'quotient' && <QuotientOfPowersLesson onComplete={handleComplete} />}
          {law.id === 'power' && <PowerOfPowerLesson onComplete={handleComplete} />}
          {law.id === 'zero' && <ZeroExponentLesson onComplete={handleComplete} />}
          {law.id === 'negative' && <NegativeExponentLesson onComplete={handleComplete} />}
          {law.id === 'product-power' && <PowerOfProductLesson onComplete={handleComplete} />}
          {law.id === 'quotient-power' && <PowerOfQuotientLesson onComplete={handleComplete} />}
          {law.id === 'identity' && <IdentityExponentLesson onComplete={handleComplete} />}
        </Card>
      </div>
    </div>
  );
};

export default LawLearn;
