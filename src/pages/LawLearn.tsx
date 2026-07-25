import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathDisplay } from '@/utils/mathRenderer';
import { ArrowLeft, Lightbulb, Film } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import { SettingsMenu } from '@/components/SettingsMenu';
import { LAW_HINTS_BY_ID } from '@/constants/lawHints';
import productOfPowersVideo from '@/assets/videos/product-of-powers.mp4';
import quotientOfPowersVideo from '@/assets/videos/quotient-of-powers.mp4';
import powerOfPowerVideo from '@/assets/videos/power-of-power.mp4';
import zeroExponentVideo from '@/assets/videos/zero-exponent.mp4';
import negativeExponentVideo from '@/assets/videos/negative-exponent.mp4';
import powerOfProductVideo from '@/assets/videos/power-of-product.mp4';
import powerOfQuotientVideo from '@/assets/videos/power-of-quotient.mp4';
import identityExponentVideo from '@/assets/videos/identity-exponent.mp4';

const ProductOfPowersLesson = lazy(() => import('@/components/lessons/ProductOfPowersLesson').then(m => ({ default: m.ProductOfPowersLesson })));
const QuotientOfPowersLesson = lazy(() => import('@/components/lessons/QuotientOfPowersLesson').then(m => ({ default: m.QuotientOfPowersLesson })));
const PowerOfPowerLesson = lazy(() => import('@/components/lessons/PowerOfPowerLesson').then(m => ({ default: m.PowerOfPowerLesson })));
const ZeroExponentLesson = lazy(() => import('@/components/lessons/ZeroExponentLesson').then(m => ({ default: m.ZeroExponentLesson })));
const NegativeExponentLesson = lazy(() => import('@/components/lessons/NegativeExponentLesson').then(m => ({ default: m.NegativeExponentLesson })));
const PowerOfProductLesson = lazy(() => import('@/components/lessons/PowerOfProductLesson').then(m => ({ default: m.PowerOfProductLesson })));
const PowerOfQuotientLesson = lazy(() => import('@/components/lessons/PowerOfQuotientLesson').then(m => ({ default: m.PowerOfQuotientLesson })));
const IdentityExponentLesson = lazy(() => import('@/components/lessons/IdentityExponentLesson').then(m => ({ default: m.IdentityExponentLesson })));

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

const lawHints = LAW_HINTS_BY_ID;

// Video with loading skeleton
const LazyVideo = ({ src, className }: { src: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative bg-muted/30 rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20">
            <div className="animate-pulse">
              <Film className="w-10 h-10 text-primary/40" />
            </div>
            <div className="h-2 w-32 rounded-full bg-muted/40 animate-pulse" />
          </div>
        )}
        <video 
          src={src}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          onLoadedData={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
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

  useEffect(() => {
    if (!law) {
      navigate('/laws');
    }
  }, [law, navigate]);

  if (!law) {
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 bg-primary/15 border border-primary/60 hover:bg-primary/25 text-primary"
              onClick={() => navigate('/laws')}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-bold text-primary truncate">{law.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{law.scene}</p>
            </div>
          </div>
          <SettingsMenu />
        </div>

        {/* Main content card */}
        <Card className="p-3 sm:p-4 md:p-6 lg:p-8 bg-primary/15 backdrop-blur-sm border-2 border-primary/60 card-learning">
          {/* Law Formula — full width */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/15 border border-primary/40 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <MathDisplay className="text-xl sm:text-2xl md:text-3xl relative z-10">{law.formula}</MathDisplay>
          </div>

          {/* Elexia's Hint — full width */}
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 bg-primary/10 border border-primary/30 rounded-lg p-3 sm:p-4 shadow-[inset_0_1px_0_hsl(var(--primary)/0.2)]">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-gem flex-shrink-0 mt-0.5 animate-orb-pulse" style={{ filter: 'drop-shadow(0 0 6px hsl(45 95% 58% / 0.4)) drop-shadow(0 0 14px hsl(45 95% 58% / 0.2))' }} />
            <div className="min-w-0">
              <p className="font-semibold text-primary mb-1 text-sm sm:text-base font-orbitron">✨ Elexia's Hint:</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {lawHints[law.id]}
              </p>
            </div>
          </div>

          {/* Two-column layout on desktop: Video (left) + Lesson (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left column: Video (sticky on desktop) */}
            {lawVideos[law.id] && (
              <div className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-lg overflow-hidden border border-primary/30">
                  <LazyVideo 
                    src={lawVideos[law.id]}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Right column: Interactive Lesson */}
            <div className="lesson-container">
              <Suspense fallback={
                <div className="space-y-4 py-8">
                  <div className="h-6 w-48 bg-muted/40 rounded animate-pulse mx-auto" />
                  <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse mx-auto" />
                  <div className="flex justify-center gap-2 pt-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
                    ))}
                  </div>
                </div>
              }>
                {law.id === 'product' && <ProductOfPowersLesson onComplete={handleComplete} />}
                {law.id === 'quotient' && <QuotientOfPowersLesson onComplete={handleComplete} />}
                {law.id === 'power' && <PowerOfPowerLesson onComplete={handleComplete} />}
                {law.id === 'zero' && <ZeroExponentLesson onComplete={handleComplete} />}
                {law.id === 'negative' && <NegativeExponentLesson onComplete={handleComplete} />}
                {law.id === 'product-power' && <PowerOfProductLesson onComplete={handleComplete} />}
                {law.id === 'quotient-power' && <PowerOfQuotientLesson onComplete={handleComplete} />}
                {law.id === 'identity' && <IdentityExponentLesson onComplete={handleComplete} />}
              </Suspense>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LawLearn;
