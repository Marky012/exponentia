import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GemDisplay } from '@/components/GemDisplay';
import { MathText } from '@/utils/mathRenderer';
import { Lock, CheckCircle, Sparkles, ArrowRight, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const Laws = () => {
  const navigate = useNavigate();
  const { laws, quizLevels, unlockQuizLevels } = useGameStore();
  const allGemsEarned = laws.every((law) => law.gemEarned);

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

  const handleUnlockQuizLevels = () => {
    unlockQuizLevels();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-orbitron font-black mb-3 text-glow">
            The 8 Laws of Exponents
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Master each law to earn a Gem of Power
          </p>
          <GemDisplay className="justify-center" />
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

        {/* Unlock Quiz Levels Button */}
        {allGemsEarned && !quizLevels.some(l => l.unlocked) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary glow-strong">
              <Sparkles className="w-16 h-16 text-gem mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-orbitron font-black mb-3 text-glow">
                All Gems Collected!
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                You've mastered all 8 Laws. Time to face the Nullers in combat!
              </p>
              <Button
                onClick={handleUnlockQuizLevels}
                size="lg"
                className="glow text-lg font-orbitron gap-2"
              >
                Unlock Quiz Battles
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Quiz Levels Section */}
        {quizLevels.some(l => l.unlocked) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Swords className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-orbitron font-bold text-foreground">
                  Battle The Nullers
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Face The Nullers in three levels of increasing difficulty. Score 75% or higher to advance.
              </p>

              <div className="space-y-4">
                {quizLevels.map((level) => (
                  <Card
                    key={level.id}
                    className={`p-4 transition-all ${
                      level.unlocked
                        ? 'bg-background/50 border-primary/30'
                        : 'bg-background/20 border-border/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          level.completed
                            ? 'bg-success/20 text-success'
                            : level.unlocked
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/20 text-muted-foreground'
                        }`}>
                          {level.completed ? (
                            <Trophy className="w-6 h-6" />
                          ) : (
                            <Swords className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{level.name} Level</h3>
                          <div className="flex items-center gap-4 mt-1">
                            {level.score !== null && (
                              <span className="text-sm text-muted-foreground">
                                Best Score: <span className="font-bold text-foreground">{level.score}%</span>
                              </span>
                            )}
                            {level.attempts > 0 && (
                              <span className="text-sm text-muted-foreground">
                                Attempts: {level.attempts}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {level.completed && (
                          <span className="text-success font-bold mr-2">✓ Defeated</span>
                        )}
                        <Button
                          onClick={() => navigate(`/quiz/${level.id}`)}
                          disabled={!level.unlocked}
                          size="sm"
                        >
                          {level.completed ? 'Retry' : level.attempts > 0 ? 'Try Again' : 'Start Battle'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Laws;
