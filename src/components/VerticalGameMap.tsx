import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { BookOpen, Swords, Trophy, ScrollText, Sparkles, Castle, BarChart3, Lock, Star, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const VerticalGameMap = () => {
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
  
  // Stages from bottom to top (reversed order for visual display)
  const stages: Stage[] = [
    {
      id: 1,
      name: 'The Beginning',
      description: 'Meet Elexia and learn your quest',
      icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10" />,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
      progress: introCompleted ? 100 : 0,
    },
    {
      id: 2,
      name: 'Training Grounds',
      description: 'Master the 8 Laws of Exponents',
      icon: <ScrollText className="w-8 h-8 md:w-10 md:h-10" />,
      route: '/laws',
      isCompleted: allGemsEarned,
      isActive: introCompleted && !allGemsEarned,
      isLocked: !introCompleted,
      progress: lawsProgress,
    },
    {
      id: 3,
      name: 'Battle Arena',
      description: 'Defeat the Nullers in combat',
      icon: <Swords className="w-8 h-8 md:w-10 md:h-10" />,
      route: '/quiz-arena',
      isCompleted: allQuizzesCompleted,
      isActive: allGemsEarned && !allQuizzesCompleted,
      isLocked: !allGemsEarned,
      progress: quizProgress,
    },
    {
      id: 4,
      name: 'The Kingdom',
      description: 'Victory & Glory Awaits',
      icon: <Castle className="w-10 h-10 md:w-12 md:h-12" />,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
      progress: allQuizzesCompleted ? 100 : 0,
    },
  ];

  // Generate particles for unlock effect
  const generateParticles = (stageIndex: number) => {
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      size: Math.random() * 10 + 4,
      delay: Math.random() * 0.4,
    }));
    setParticles(newParticles);
    setShowUnlockEffect(stageIndex);
    
    setTimeout(() => {
      setParticles([]);
      setShowUnlockEffect(null);
    }, 2000);
  };

  const handleStageClick = (stage: Stage, index: number) => {
    if (!stage.isLocked) {
      if (stage.isCompleted && index < stages.length - 1) {
        generateParticles(index);
      }
      navigate(stage.route);
    }
  };

  // Reverse stages for bottom-to-top display
  const displayStages = [...stages].reverse();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Castle Background at top */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-background to-background" />
        
        {/* Castle silhouette at top */}
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <div className="relative h-40 md:h-52">
            {/* Castle towers */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center gap-2">
              <div className="w-8 h-24 md:w-12 md:h-32 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-lg" />
              <div className="w-6 h-20 md:w-8 md:h-28 bg-gradient-to-t from-primary/50 to-primary/10 rounded-t-lg" />
              <div className="w-12 h-32 md:w-16 md:h-44 bg-gradient-to-t from-primary/70 to-primary/30 rounded-t-xl">
                {/* Main tower flag */}
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-1 h-8 bg-primary/60" />
                  <div className="absolute top-0 left-1 w-6 h-4 bg-gem rounded-sm" />
                </motion.div>
              </div>
              <div className="w-6 h-20 md:w-8 md:h-28 bg-gradient-to-t from-primary/50 to-primary/10 rounded-t-lg" />
              <div className="w-8 h-24 md:w-12 md:h-32 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-lg" />
            </div>
            
            {/* Glow effect when castle is unlocked */}
            {allQuizzesCompleted && (
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gem/20 rounded-full blur-3xl"
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
        
        {/* Stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 40}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Statistics Button */}
      <motion.div 
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/statistics')}
          className="gap-2 bg-background/80 backdrop-blur-sm"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Stats</span>
        </Button>
      </motion.div>

      {/* Title */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <h1 className="text-xl md:text-2xl font-orbitron font-bold text-primary">EXPONENTIA</h1>
        <p className="text-xs text-muted-foreground">Your Quest Awaits</p>
      </motion.div>

      {/* Main Map Path */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20 px-4">
        {/* Path Background */}
        <div className="absolute left-1/2 -translate-x-1/2 w-4 md:w-6 h-[70%] top-[15%]">
          {/* Path track */}
          <div className="absolute inset-0 bg-muted/50 rounded-full border border-muted-foreground/20" />
          
          {/* Animated path fill from bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40 rounded-full"
            initial={{ height: '0%' }}
            animate={{ 
              height: `${Math.min(
                ((stages.filter(s => s.isCompleted).length) / stages.length) * 100,
                100
              )}%` 
            }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </div>

        {/* Stage Nodes */}
        <div className="relative flex flex-col gap-24 md:gap-32">
          {displayStages.map((stage, displayIndex) => {
            const actualIndex = stages.length - 1 - displayIndex;
            const isEven = displayIndex % 2 === 0;
            
            return (
              <motion.div
                key={stage.id}
                className={`relative flex items-center gap-6 md:gap-10 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: displayIndex * 0.2 }}
              >
                {/* Stage Info Card */}
                <motion.div
                  className={`w-36 md:w-48 ${isEven ? 'text-right' : 'text-left'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + displayIndex * 0.2 }}
                >
                  <h3 className={`font-bold text-sm md:text-lg ${stage.isLocked ? 'text-muted-foreground/80' : 'text-foreground'}`}>
                    {stage.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground/70 mt-1">
                    {stage.description}
                  </p>
                  
                  {/* Progress indicator */}
                  {stage.isActive && stage.progress > 0 && stage.progress < 100 && (
                    <motion.div 
                      className="mt-2 flex items-center gap-2"
                      style={{ justifyContent: isEven ? 'flex-end' : 'flex-start' }}
                    >
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary">{Math.round(stage.progress)}%</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Stage Node */}
                <div className="relative">
                  {/* Outer glow for active stage */}
                  {stage.isActive && (
                    <motion.div
                      className="absolute inset-0 -m-4 rounded-full bg-primary/20 blur-xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Progress Ring */}
                  <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={stage.isCompleted ? 'hsl(var(--primary))' : stage.isActive ? 'hsl(var(--primary))' : 'transparent'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 45 * (1 - stage.progress / 100) 
                      }}
                      transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>

                  <motion.button
                    onClick={() => handleStageClick(stage, actualIndex)}
                    disabled={stage.isLocked}
                    className={`
                      relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 
                      flex items-center justify-center
                      transition-all duration-300 z-10
                      ${stage.isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/50' 
                        : stage.isActive 
                          ? 'bg-secondary border-primary text-primary shadow-xl shadow-primary/30 animate-pulse' 
                          : stage.isLocked 
                            ? 'bg-muted/50 border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-60' 
                            : 'bg-card border-border text-foreground hover:border-primary hover:shadow-xl'
                      }
                    `}
                    whileHover={!stage.isLocked ? { scale: 1.15 } : {}}
                    whileTap={!stage.isLocked ? { scale: 0.95 } : {}}
                  >
                    {/* Particle Effects */}
                    <AnimatePresence>
                      {showUnlockEffect === actualIndex && particles.map((particle) => (
                        <motion.div
                          key={particle.id}
                          className="absolute bg-gem rounded-full"
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ 
                            x: particle.x, 
                            y: particle.y, 
                            opacity: 0, 
                            scale: 0 
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 1, 
                            delay: particle.delay,
                            ease: 'easeOut' 
                          }}
                          style={{ width: particle.size, height: particle.size }}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Sparkle effect for completed */}
                    {stage.isCompleted && (
                      <>
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5 text-gem" />
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-1 -left-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Star className="w-4 h-4 text-gem fill-gem" />
                        </motion.div>
                      </>
                    )}
                    
                    {/* Completion checkmark */}
                    {stage.isCompleted && (
                      <motion.div
                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-background shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <span className="text-white text-sm font-bold">✓</span>
                      </motion.div>
                    )}
                    
                    {/* Lock or Icon */}
                    {stage.isLocked ? (
                      <Lock className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                    ) : (
                      stage.icon
                    )}
                  </motion.button>

                  {/* Stage Number */}
                  <motion.div
                    className={`
                      absolute -top-2 -left-2 w-7 h-7 md:w-8 md:h-8 rounded-full 
                      flex items-center justify-center text-xs md:text-sm font-bold border-2 border-background shadow-md
                      ${stage.isCompleted 
                        ? 'bg-green-500 text-white' 
                        : stage.isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + displayIndex * 0.2 }}
                  >
                    {stage.id}
                  </motion.div>
                </div>

                {/* Arrow indicator for current stage */}
                {stage.isActive && (
                  <motion.div
                    className={`absolute ${isEven ? '-left-2' : '-right-2'} top-1/2 -translate-y-1/2`}
                    animate={{ x: isEven ? [-5, 0, -5] : [5, 0, 5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ChevronUp className={`w-6 h-6 text-primary ${isEven ? 'rotate-90' : '-rotate-90'}`} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Journey indicator at bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-xs text-muted-foreground">
            {allQuizzesCompleted ? '🎉 Kingdom Saved!' : 'Climb to the Kingdom'}
          </p>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronUp className="w-5 h-5 text-primary mx-auto mt-1" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerticalGameMap;
