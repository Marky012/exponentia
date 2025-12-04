import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { BookOpen, Swords, Trophy, ScrollText, Sparkles } from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  progress: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const GameMap = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels } = useGameStore();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showUnlockEffect, setShowUnlockEffect] = useState<number | null>(null);
  
  const allLawsCompleted = laws.every(law => law.completed);
  const allGemsEarned = laws.every(law => law.gemEarned);
  const allQuizzesCompleted = quizLevels.every(level => level.completed);
  
  // Calculate progress percentages
  const lawsProgress = (laws.filter(law => law.gemEarned).length / laws.length) * 100;
  const quizProgress = (quizLevels.filter(level => level.completed).length / quizLevels.length) * 100;
  
  const stages: Stage[] = [
    {
      id: 1,
      name: 'Introduction',
      description: 'Meet Elexia and begin your journey',
      icon: <BookOpen className="w-5 h-5 md:w-6 md:h-6" />,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
      progress: introCompleted ? 100 : 0,
    },
    {
      id: 2,
      name: 'Training',
      description: 'Learn the 8 Laws of Exponents',
      icon: <ScrollText className="w-5 h-5 md:w-6 md:h-6" />,
      route: '/laws',
      isCompleted: allGemsEarned,
      isActive: introCompleted && !allGemsEarned,
      isLocked: !introCompleted,
      progress: lawsProgress,
    },
    {
      id: 3,
      name: 'Quiz Battle',
      description: 'Test your knowledge in combat',
      icon: <Swords className="w-5 h-5 md:w-6 md:h-6" />,
      route: '/laws',
      isCompleted: allQuizzesCompleted,
      isActive: allGemsEarned && !allQuizzesCompleted,
      isLocked: !allGemsEarned,
      progress: quizProgress,
    },
    {
      id: 4,
      name: 'Victory',
      description: 'View achievements & report',
      icon: <Trophy className="w-5 h-5 md:w-6 md:h-6" />,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
      progress: allQuizzesCompleted ? 100 : 0,
    },
  ];

  // Generate particles for unlock effect
  const generateParticles = (stageIndex: number) => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);
    setShowUnlockEffect(stageIndex);
    
    setTimeout(() => {
      setParticles([]);
      setShowUnlockEffect(null);
    }, 1500);
  };

  // Watch for stage unlocks
  useEffect(() => {
    const unlockedStage = stages.findIndex(s => s.isActive && !s.isCompleted);
    if (unlockedStage > 0 && !stages[unlockedStage - 1].isLocked) {
      // Stage just unlocked - could trigger effect here
    }
  }, [stages]);

  const handleStageClick = (stage: Stage, index: number) => {
    if (!stage.isLocked) {
      if (stage.isCompleted && index < stages.length - 1) {
        generateParticles(index);
      }
      navigate(stage.route);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-6 px-2 md:px-4">
      {/* Stage Nodes */}
      <div className="relative flex justify-between items-center">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            {/* Connecting Line with Progress Fill */}
            {index < stages.length - 1 && (
              <div className="absolute top-8 md:top-10 left-full w-[calc(100%-1rem)] md:w-20 lg:w-28 h-2 -z-10 ml-2">
                {/* Background track */}
                <div className="absolute inset-0 bg-muted/50 rounded-full" />
                
                {/* Progress fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: stages[index].isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.3, ease: 'easeOut' }}
                />
                
                {/* Animated pulse on active connection */}
                {stages[index].isCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-primary/30 rounded-full"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            )}

            {/* Stage Circle with Progress Ring */}
            <div className="relative">
              {/* Progress Ring */}
              <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={stage.isCompleted ? 'hsl(var(--primary))' : stage.isActive ? 'hsl(var(--primary))' : 'transparent'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - stage.progress / 100) 
                  }}
                  transition={{ duration: 1.5, delay: 0.3 + index * 0.2, ease: 'easeOut' }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>

              <motion.button
                onClick={() => handleStageClick(stage, index)}
                disabled={stage.isLocked}
                className={`
                  relative w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full border-4 
                  flex items-center justify-center
                  transition-all duration-300
                  ${stage.isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/50' 
                    : stage.isActive 
                      ? 'bg-secondary border-primary text-primary shadow-lg shadow-primary/30' 
                      : stage.isLocked 
                        ? 'bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-50' 
                        : 'bg-card border-border text-foreground hover:border-primary hover:shadow-lg'
                  }
                `}
                whileHover={!stage.isLocked ? { scale: 1.1 } : {}}
                whileTap={!stage.isLocked ? { scale: 0.95 } : {}}
              >
                {/* Particle Effects */}
                <AnimatePresence>
                  {showUnlockEffect === index && particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute w-2 h-2 bg-gem rounded-full"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ 
                        x: particle.x, 
                        y: particle.y, 
                        opacity: 0, 
                        scale: 0 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: particle.delay,
                        ease: 'easeOut' 
                      }}
                      style={{ width: particle.size, height: particle.size }}
                    />
                  ))}
                </AnimatePresence>

                {/* Glow effect for active stage */}
                {stage.isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                {/* Sparkle effect for completed */}
                {stage.isCompleted && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-gem" />
                  </motion.div>
                )}
                
                {/* Completion checkmark */}
                {stage.isCompleted && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
                
                {/* Lock icon for locked stages */}
                {stage.isLocked ? (
                  <span className="text-lg md:text-xl">🔒</span>
                ) : (
                  stage.icon
                )}
              </motion.button>

              {/* Stage Number Badge */}
              <motion.div
                className={`
                  absolute -top-1 -left-1 w-5 h-5 md:w-6 md:h-6 rounded-full 
                  flex items-center justify-center text-xs font-bold border-2 border-background
                  ${stage.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : stage.isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.2 }}
              >
                {stage.id}
              </motion.div>
            </div>

            {/* Stage Label */}
            <motion.div
              className="text-center mt-3 w-20 md:w-24"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
            >
              <p className={`font-semibold text-xs md:text-sm ${stage.isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.name}
              </p>
              
              {/* Progress percentage for active stage */}
              {stage.isActive && stage.progress > 0 && stage.progress < 100 && (
                <motion.p 
                  className="text-xs text-primary font-bold mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(stage.progress)}%
                </motion.p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1 hidden md:block leading-tight">
                {stage.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameMap;
