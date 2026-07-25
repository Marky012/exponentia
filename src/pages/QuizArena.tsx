import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Swords, Trophy, Lock, Star, Target, Flame, Bug } from 'lucide-react';
import { InstallButton } from '@/components/InstallButton';
import { SettingsMenu } from '@/components/SettingsMenu';
import { toast } from 'sonner';
import exponentiaBg from '@/assets/exponentia-light.png';
import { isDevelopmentMode } from '@/utils/inputValidation';
import { PASSING_SCORE, MAX_ATTEMPTS } from '@/constants/gameConfig';

const QuizArena = () => {
  const navigate = useNavigate();
  const { quizLevels, laws, debugMode, toggleDebugMode, unlockAllForTesting } = useGameStore();
  
  const allGemsEarned = laws.every(law => law.gemEarned);
  
  const isDevMode = isDevelopmentMode();
  
  // Debug mode keyboard shortcut (Ctrl+Shift+D) - only available in development
  useEffect(() => {
    if (!isDevMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebugMode();
        toast.info(debugMode ? 'Debug mode disabled' : 'Debug mode enabled - Press unlock button to unlock all levels');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode, toggleDebugMode, isDevMode]);

  const handleUnlockAll = () => {
    unlockAllForTesting();
    toast.success('All levels and gems unlocked for testing!');
  };
  
  // If not all gems earned and not in debug mode, show locked message
  if (!allGemsEarned && !(debugMode && isDevMode)) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${exponentiaBg})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <SettingsMenu />
        </div>
        <Card className="p-8 text-center max-w-md bg-card/90 backdrop-blur-sm">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Arena Locked</h2>
          <p className="text-muted-foreground mb-4">
            Complete all training and earn all gems to unlock the Battle Arena.
          </p>
          {isDevMode && (
            <p className="text-xs text-muted-foreground/50 mb-4">
              Tip: Press Ctrl+Shift+D to enable debug mode
            </p>
          )}
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
      case 'easy': return 'from-diff-easy to-emerald-700';
      case 'medium': return 'from-diff-medium to-amber-700';
      case 'hard': return 'from-diff-hard to-rose-800';
      default: return 'from-primary to-primary/80';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-cover bg-center p-4 md:p-8"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${exponentiaBg})` }}
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
          <div className="flex items-center gap-2">
            <SettingsMenu />
            <InstallButton />
          </div>
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
          
          {/* Debug mode indicator and unlock button - only in development */}
          {debugMode && isDevMode && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Bug className="w-3 h-3" />
                DEBUG MODE (DEV ONLY)
              </div>
              {!allGemsEarned && (
                <Button size="sm" variant="outline" onClick={handleUnlockAll} className="text-xs">
                  Unlock All Levels
                </Button>
              )}
            </div>
          )}
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
                  relative overflow-hidden transition-all duration-300 border
                  ${level.unlocked 
                    ? level.completed
                      ? 'hover:shadow-lg hover:scale-[1.02] border-gem/40 shadow-[0_0_16px_hsl(45_95%_58%/0.1)]'
                      : 'hover:shadow-lg hover:scale-[1.02] border-border hover:border-primary/40'
                    : 'opacity-60 border-border'
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
                              : level.attempts.length >= 3
                                ? `${MAX_ATTEMPTS}/${MAX_ATTEMPTS} attempts used — Average below ${PASSING_SCORE}%`
                                : `${level.attempts.length}/${MAX_ATTEMPTS} attempts used`
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
                        disabled={!level.unlocked || (level.attempts.length >= 3 && !level.completed)}
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
                        {level.completed ? 'Retry' : level.attempts.length >= 3 ? 'Max Attempts' : level.unlocked ? 'Battle!' : 'Locked'}
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
                        <span className="badge-gem">CLEARED</span>
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
