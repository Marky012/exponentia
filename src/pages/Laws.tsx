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
      className="min-h-screen p-4 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <ExponentiaBackground overlayOpacity={0.4} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/hub')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Map
            </Button>
            <GemDisplay />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-orbitron font-black mb-3 text-glow">
              Training Grounds
            </h1>
            <p className="text-muted-foreground">
              Master each law to earn a Gem of Power
            </p>
          </div>
        </motion.div>

        {/* Laws Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {laws.map((law, index) => (
            <motion.div
              key={law.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                  law.gemEarned
                    ? "bg-gem/10 border-gem shadow-[0_0_20px_hsl(var(--gem-glow)/0.3)]"
                    : law.completed
                    ? "bg-primary/10 border-primary/50"
                    : "bg-card border-border hover:border-primary/50"
                )}
                onClick={() => handleLawClick(law.id, law.completed, law.gemEarned)}
              >
                {/* Status Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">
                    {law.gemEarned ? (
                      <div className="relative">
                        <Sparkles className="w-10 h-10 text-gem animate-pulse" />
                        <div className="absolute inset-0 bg-gem/20 rounded-full blur-xl" />
                      </div>
                    ) : law.completed ? (
                      <CheckCircle className="w-10 h-10 text-primary" />
                    ) : (
                      <Lock className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs font-orbitron text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>

                {/* Law Details */}
                <h3 className="font-orbitron font-bold text-lg mb-2">{law.name}</h3>
                <div className="bg-background/50 rounded p-3 mb-3">
                  <MathText className="text-primary font-medium">{law.formula}</MathText>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{law.scene}</p>

                {/* Action */}
                {law.gemEarned ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Review
                  </Button>
                ) : law.completed ? (
                  <Button
                    size="sm"
                    className="w-full"
                  >
                    Take Pre-Test
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
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
