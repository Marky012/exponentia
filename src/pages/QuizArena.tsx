import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Swords, Trophy, Lock, Star, Target, Flame } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';

const QuizArena = () => {
  const navigate = useNavigate();
  const { quizLevels, laws } = useGameStore();
  
  const allGemsEarned = laws.every(law => law.gemEarned);
  
  // If not all gems earned, redirect back
  if (!allGemsEarned) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Arena Locked</h2>
          <p className="text-muted-foreground mb-4">
            Complete all training and earn all gems to unlock the Battle Arena.
          </p>
          <Button onClick={() => navigate('/hub')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Map
          </Button>
        </Card>
      </motion.div>
    );
  }

  const getDifficultyIcon = (levelId: string) => {
    switch (levelId) {
      case 'easy': return <Target className="w-5 h-5" />;
      case 'medium': return <Flame className="w-5 h-5" />;
      case 'hard': return <Swords className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (levelId: string) => {
    switch (levelId) {
      case 'easy': return 'from-green-500 to-emerald-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'hard': return 'from-red-500 to-rose-600';
      default: return 'from-primary to-primary/80';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/hub')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Map
          </Button>
          <InstallButton />
        </div>

        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Swords className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold">Battle Arena</h1>
            <Swords className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Defeat the Nullers and save Exponentia!
          </p>
        </motion.div>

        {/* Quiz Levels */}
        <div className="space-y-4">
          {quizLevels.map((level, index) => {
            const bestScore = level.attempts.length > 0 
              ? Math.max(...level.attempts.map(a => a.score))
              : 0;
            
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className={`
                  relative overflow-hidden transition-all duration-300
                  ${level.unlocked 
                    ? 'hover:shadow-lg hover:scale-[1.02]' 
                    : 'opacity-60'
                  }
                `}>
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getDifficultyColor(level.id)} opacity-10`} />
                  
                  <div className="relative p-4 md:p-6">
                    <div className="flex items-center gap-4">
                      {/* Level Icon */}
                      <div className={`
                        w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
                        bg-gradient-to-br ${getDifficultyColor(level.id)} text-white shadow-lg
                        ${level.completed ? 'ring-4 ring-gem ring-offset-2 ring-offset-background' : ''}
                      `}>
                        {level.unlocked ? (
                          level.completed ? (
                            <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                          ) : (
                            getDifficultyIcon(level.id)
                          )
                        ) : (
                          <Lock className="w-6 h-6 md:w-8 md:h-8" />
                        )}
                      </div>

                      {/* Level Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg md:text-xl capitalize">
                            {level.id} Battle
                          </h3>
                          {level.completed && (
                            <Star className="w-5 h-5 text-gem fill-gem" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {level.unlocked
                            ? level.completed
                              ? `Best Score: ${bestScore}% • ${level.attempts.length} attempt(s)`
                              : `${level.attempts.length}/3 attempts used`
                            : 'Complete previous level to unlock'
                          }
                        </p>

                        {/* Progress bar for attempts */}
                        {level.unlocked && !level.completed && level.attempts.length > 0 && (
                          <div className="mt-2">
                            <div className="flex gap-1">
                              {[0, 1, 2].map(i => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    i < level.attempts.length ? 'bg-primary' : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => navigate(`/quiz/${level.id}`)}
                        disabled={!level.unlocked}
                        className={`
                          shrink-0
                          ${level.completed 
                            ? 'bg-gem hover:bg-gem/90' 
                            : level.unlocked 
                              ? `bg-gradient-to-r ${getDifficultyColor(level.id)} hover:opacity-90`
                              : ''
                          }
                        `}
                      >
                        {level.completed ? 'Retry' : level.unlocked ? 'Battle!' : 'Locked'}
                      </Button>
                    </div>
                  </div>

                  {/* Completed overlay effect */}
                  <AnimatePresence>
                    {level.completed && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          CLEARED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* All cleared message */}
        <AnimatePresence>
          {quizLevels.every(l => l.completed) && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-br from-gem/20 to-primary/20 border-gem/50">
                <Trophy className="w-12 h-12 text-gem mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">🎉 All Battles Won!</h2>
                <p className="text-muted-foreground mb-4">
                  You've defeated all the Nullers and saved Exponentia!
                </p>
                <Button onClick={() => navigate('/hub')} variant="default">
                  Return to Kingdom
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuizArena;
