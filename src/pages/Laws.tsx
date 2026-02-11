import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GemDisplay } from '@/components/GemDisplay';
import { MathText } from '@/utils/mathRenderer';
import { Lock, CheckCircle, Sparkles, ArrowLeft, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExponentiaBackground from '@/components/ExponentiaBackground';
import { SettingsMenu } from '@/components/SettingsMenu';

const Laws = () => {
  const navigate = useNavigate();
  const { laws } = useGameStore();

  const handleLawClick = (lawId: string, completed: boolean, gemEarned: boolean) => {
    if (gemEarned) {
      // Already completed, just view
      navigate(`/law/${lawId}`);
    } else if (!completed) {
      // Start learning
      navigate(`/law/${lawId}`);
    } else {
      // Take pre-test
      navigate(`/pretest/${lawId}`);
    }
  };

  return (
    <motion.div 
      className="min-h-screen p-3 sm:p-4 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <ExponentiaBackground overlayOpacity={0.4} />
      
      {/* Settings button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <SettingsMenu />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/hub')}
              className="gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Back to Map</span>
              <span className="xs:hidden">Back</span>
            </Button>
            <GemDisplay />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-black mb-2 sm:mb-3 text-glow">
              Training Grounds
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Master each law to earn a Gem of Power
            </p>
          </div>
        </motion.div>

        {/* Laws Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {laws.map((law, index) => (
            <motion.div
              key={law.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "p-3 sm:p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 h-full",
                  law.gemEarned
                    ? "bg-gem/10 border-gem shadow-[0_0_20px_hsl(var(--gem-glow)/0.3)]"
                    : law.completed
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card border-border hover:border-primary/50"
                )}
                onClick={() => handleLawClick(law.id, law.completed, law.gemEarned)}
              >
                {/* Status Icon */}
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <div className="text-3xl sm:text-4xl">
                    {law.gemEarned ? (
                      <div className="relative">
                        <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-gem animate-pulse" />
                        <div className="absolute inset-0 bg-gem/20 rounded-full blur-xl" />
                      </div>
                    ) : law.completed ? (
                      <CheckCircle className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
                    ) : (
                      <Lock className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs font-orbitron text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>

                {/* Law Details */}
                <h3 className="font-orbitron font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 leading-tight">{law.name}</h3>
                <div className="bg-background/50 rounded p-2 sm:p-3 mb-2 sm:mb-3">
                  <MathText className="text-primary font-medium text-xs sm:text-sm">{law.formula}</MathText>
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-2 sm:mb-3">{law.scene}</p>

                {/* Action */}
                {law.gemEarned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs sm:text-sm h-8 sm:h-9"
                  >
                    Review
                  </Button>
                ) : law.completed ? (
                  <Button
                    size="sm"
                    className="w-full text-xs sm:text-sm h-8 sm:h-9"
                  >
                    Take Pre-Test
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs sm:text-sm h-8 sm:h-9"
                  >
                    Start Learning
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* All gems collected message */}
        {laws.every(law => law.gemEarned) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-8"
          >
            <Card className="p-6 bg-gradient-to-br from-gem/20 to-primary/20 border-gem/50">
              <Sparkles className="w-12 h-12 text-gem mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">All Gems Collected!</h2>
              <p className="text-muted-foreground mb-4">
                Return to the map to enter the Battle Arena!
              </p>
              <Button onClick={() => navigate('/hub')} className="gap-2">
                <Map className="w-4 h-4" />
                Return to Map
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Laws;
