import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Lightbulb, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ProductOfPowersLesson } from '@/components/lessons/ProductOfPowersLesson';
import { QuotientOfPowersLesson } from '@/components/lessons/QuotientOfPowersLesson';
import { PowerOfPowerLesson } from '@/components/lessons/PowerOfPowerLesson';
import { ZeroExponentLesson } from '@/components/lessons/ZeroExponentLesson';
import { NegativeExponentLesson } from '@/components/lessons/NegativeExponentLesson';
import { PowerOfProductLesson } from '@/components/lessons/PowerOfProductLesson';
import { PowerOfQuotientLesson } from '@/components/lessons/PowerOfQuotientLesson';
import { IdentityExponentLesson } from '@/components/lessons/IdentityExponentLesson';
import productOfPowersVideo from '@/assets/videos/product-of-powers.mp4';
import quotientOfPowersVideo from '@/assets/videos/quotient-of-powers.mp4';
import powerOfPowerVideo from '@/assets/videos/power-of-power.mp4';
import zeroExponentVideo from '@/assets/videos/zero-exponent.mp4';
import negativeExponentVideo from '@/assets/videos/negative-exponent.mp4';
import powerOfProductVideo from '@/assets/videos/power-of-product.mp4';
import powerOfQuotientVideo from '@/assets/videos/power-of-quotient.mp4';
import identityExponentVideo from '@/assets/videos/identity-exponent.mp4';

const lawVideos: Record<string, string> = {
  product: productOfPowersVideo,
  quotient: quotientOfPowersVideo,
  power: powerOfPowerVideo,
  zero: zeroExponentVideo,
  negative: negativeExponentVideo,
  'product-power': powerOfProductVideo,
  'quotient-power': powerOfQuotientVideo,
  identity: identityExponentVideo,
};

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

// Direct video component - preloads and plays instantly
const LazyVideo = ({ src, className }: { src: string; className?: string }) => {
  return (
    <div className={`relative bg-muted/30 rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video">
        <video 
          src={src}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
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
    navigate(`/pretest/${law.id}`);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 relative">
      <ExponentiaBackground overlayOpacity={0.4} />
      
      {/* Settings button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <SettingsMenu />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
            onClick={() => navigate('/laws')}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-bold text-glow truncate">{law.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{law.scene}</p>
          </div>
        </div>

        <Card className="p-3 sm:p-4 md:p-6 lg:p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          {/* Law Formula */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 text-center">
            <MathDisplay className="text-xl sm:text-2xl md:text-3xl">{law.formula}</MathDisplay>
          </div>

          {/* Elexia's Guidance */}
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8 bg-muted/20 border border-border rounded-lg p-3 sm:p-4">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-primary mb-1 text-sm sm:text-base">Elexia's Hint:</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {lawHints[law.id]}
              </p>
            </div>
          </div>

          {/* Educational Video Guide with Lazy Loading */}
          {lawVideos[law.id] && (
            <div className="mb-4 sm:mb-6 md:mb-8 rounded-lg overflow-hidden border border-primary/30">
              <LazyVideo 
                src={lawVideos[law.id]}
                className="w-full"
              />
            </div>
          )}

          {/* Interactive Lessons */}
          <div className="lesson-container">
            {law.id === 'product' && <ProductOfPowersLesson onComplete={handleComplete} />}
            {law.id === 'quotient' && <QuotientOfPowersLesson onComplete={handleComplete} />}
            {law.id === 'power' && <PowerOfPowerLesson onComplete={handleComplete} />}
            {law.id === 'zero' && <ZeroExponentLesson onComplete={handleComplete} />}
            {law.id === 'negative' && <NegativeExponentLesson onComplete={handleComplete} />}
            {law.id === 'product-power' && <PowerOfProductLesson onComplete={handleComplete} />}
            {law.id === 'quotient-power' && <PowerOfQuotientLesson onComplete={handleComplete} />}
            {law.id === 'identity' && <IdentityExponentLesson onComplete={handleComplete} />}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LawLearn;
