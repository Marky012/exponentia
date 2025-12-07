import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Lock, Star, BarChart3, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEffects } from '@/utils/soundEffects';

// Import map icons
import map1Icon from '@/assets/map1.png';
import map2Icon from '@/assets/map2.png';
import map3Icon from '@/assets/map3.png';
import map4Icon from '@/assets/map4.png';
import exponentiaBg from '@/assets/exponentia-light.png';

interface Stage {
  id: number;
  name: string;
  description: string;
  icon: string;
  route: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  progress: number;
  stars: number;
}

interface UnlockParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const VerticalGameMap = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels } = useGameStore();
  const [unlockingStage, setUnlockingStage] = useState<number | null>(null);
  const [particles, setParticles] = useState<UnlockParticle[]>([]);
  const previousStagesRef = useRef<boolean[]>([]);
  
  const allGemsEarned = laws.every(law => law.gemEarned);
  const allQuizzesCompleted = quizLevels.every(level => level.completed);
  
  // Calculate progress percentages
  const lawsProgress = (laws.filter(law => law.gemEarned).length / laws.length) * 100;
  const quizProgress = (quizLevels.filter(level => level.completed).length / quizLevels.length) * 100;
  
  // Calculate stars (0-3) for each stage
  const getStars = (isCompleted: boolean, progress: number): number => {
    if (!isCompleted && progress === 0) return 0;
    if (isCompleted) return 3;
    if (progress >= 66) return 2;
    if (progress >= 33) return 1;
    return 0;
  };

  // Stages from bottom to top
  const stages: Stage[] = [
    {
      id: 1,
      name: 'The Beginning',
      description: 'Meet Elexia',
      icon: map1Icon,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
      progress: introCompleted ? 100 : 0,
      stars: getStars(introCompleted, introCompleted ? 100 : 0),
    },
    {
      id: 2,
      name: 'Training Grounds',
      description: 'Master 8 Laws',
      icon: map2Icon,
      route: '/laws',
      isCompleted: allGemsEarned,
      isActive: introCompleted && !allGemsEarned,
      isLocked: !introCompleted,
      progress: lawsProgress,
      stars: getStars(allGemsEarned, lawsProgress),
    },
    {
      id: 3,
      name: 'Battle Arena',
      description: 'Defeat Nullers',
      icon: map3Icon,
      route: '/quiz-arena',
      isCompleted: allQuizzesCompleted,
      isActive: allGemsEarned && !allQuizzesCompleted,
      isLocked: !allGemsEarned,
      progress: quizProgress,
      stars: getStars(allQuizzesCompleted, quizProgress),
    },
    {
      id: 4,
      name: 'The Kingdom',
      description: 'Victory Awaits',
      icon: map4Icon,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
      progress: allQuizzesCompleted ? 100 : 0,
      stars: getStars(allQuizzesCompleted, allQuizzesCompleted ? 100 : 0),
    },
  ];

  // Check for newly unlocked stages
  useEffect(() => {
    const currentUnlockStates = stages.map(s => !s.isLocked);
    
    if (previousStagesRef.current.length > 0) {
      currentUnlockStates.forEach((isUnlocked, index) => {
        if (isUnlocked && !previousStagesRef.current[index]) {
          // Stage just got unlocked!
          triggerUnlockAnimation(index);
        }
      });
    }
    
    previousStagesRef.current = currentUnlockStates;
  }, [introCompleted, allGemsEarned, allQuizzesCompleted]);

  const triggerUnlockAnimation = (stageIndex: number) => {
    setUnlockingStage(stageIndex);
    soundEffects.playUnlock();
    
    // Generate particles
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const newParticles: UnlockParticle[] = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
      size: Math.random() * 12 + 6,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
    
    setTimeout(() => {
      setUnlockingStage(null);
      setParticles([]);
    }, 1500);
  };

  const handleStageClick = (stage: Stage, index: number) => {
    if (stage.isLocked) {
      soundEffects.playLocked();
      return;
    }
    soundEffects.playMapSelect();
    navigate(stage.route);
  };

  const handleStageHover = (stage: Stage) => {
    if (!stage.isLocked) {
      soundEffects.playHover();
    }
  };

  // Reversed for display (bottom to top becomes top to bottom in scroll)
  const displayStages = [...stages].reverse();

  // Define winding path positions for each stage
  const getStagePosition = (index: number): { marginLeft: string; marginRight: string } => {
    const positions = [
      { marginLeft: '50%', marginRight: '0' },    // Stage 4 (Kingdom) - right side
      { marginLeft: '5%', marginRight: '0' },     // Stage 3 (Arena) - left side
      { marginLeft: '50%', marginRight: '0' },    // Stage 2 (Training) - right side
      { marginLeft: '5%', marginRight: '0' },     // Stage 1 (Beginning) - left side
    ];
    return positions[index];
  };

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${exponentiaBg})`,
        backgroundSize: 'cover',
      }}
    >
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      {/* Floating magical particles background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Title with fantasy styling */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-amber-600/50 shadow-lg">
          <h1 className="text-xl md:text-2xl font-orbitron font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            EXPONENTIA
          </h1>
          <p className="text-xs text-amber-200/80">Your Quest Awaits</p>
        </div>
      </motion.div>

      {/* Statistics Button */}
      <motion.div 
        className="absolute top-16 right-4 z-20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            soundEffects.playClick();
            navigate('/statistics');
          }}
          className="gap-2 bg-amber-900/70 border-amber-600/50 text-amber-100 hover:bg-amber-800/80 hover:text-amber-50 backdrop-blur-sm shadow-lg"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Stats</span>
        </Button>
      </motion.div>

      {/* Winding Path SVG - Golden fantasy road */}
      <svg 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Path glow */}
        <motion.path
          d="M 20 88 Q 50 78 70 68 Q 30 58 20 48 Q 60 38 70 28 Q 40 18 50 10"
          fill="none"
          stroke="rgba(255,200,100,0.3)"
          strokeWidth="8"
          strokeLinecap="round"
          filter="blur(4px)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Main path */}
        <motion.path
          d="M 20 88 Q 50 78 70 68 Q 30 58 20 48 Q 60 38 70 28 Q 40 18 50 10"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
        />
        {/* Path border */}
        <path
          d="M 20 88 Q 50 78 70 68 Q 30 58 20 48 Q 60 38 70 28 Q 40 18 50 10"
          fill="none"
          stroke="rgba(139,69,19,0.6)"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ zIndex: -1 }}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D4A574" />
            <stop offset="50%" stopColor="#C19A6B" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stage Nodes */}
      <div className="relative z-10 min-h-screen py-20 px-4">
        <div className="relative max-w-sm mx-auto h-[85vh] flex flex-col justify-between">
          {displayStages.map((stage, displayIndex) => {
            const position = getStagePosition(displayIndex);
            const actualIndex = stages.length - 1 - displayIndex;
            const isUnlocking = unlockingStage === actualIndex;
            
            return (
              <motion.div
                key={stage.id}
                className="relative"
                style={{ 
                  marginLeft: position.marginLeft,
                  marginRight: position.marginRight,
                }}
                initial={{ opacity: 0, scale: 0.3, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.4 + displayIndex * 0.2,
                  type: "spring",
                  stiffness: 150
                }}
              >
                {/* Stars above stage */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
                  {[1, 2, 3].map((starNum) => (
                    <motion.div
                      key={starNum}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: stage.stars >= starNum ? 1 : 0.5, 
                        rotate: 0 
                      }}
                      transition={{ 
                        delay: 1 + displayIndex * 0.2 + starNum * 0.1,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <Star 
                        className={`w-6 h-6 drop-shadow-lg transition-all ${
                          stage.stars >= starNum 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-400/30 fill-gray-400/20'
                        }`}
                        style={{
                          filter: stage.stars >= starNum ? 'drop-shadow(0 0 6px rgba(255,200,0,0.8))' : 'none'
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Stage Button Container */}
                <div className="relative">
                  {/* Unlock particles */}
                  <AnimatePresence>
                    {isUnlocking && particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                        style={{
                          width: particle.size,
                          height: particle.size,
                          backgroundColor: particle.color,
                          boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                        }}
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
                      />
                    ))}
                  </AnimatePresence>

                  {/* Unlock flash effect */}
                  <AnimatePresence>
                    {isUnlocking && (
                      <motion.div
                        className="absolute inset-0 -m-4 rounded-full bg-yellow-400/60 blur-xl"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 2, opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Stage Button */}
                  <motion.button
                    onClick={() => handleStageClick(stage, actualIndex)}
                    onMouseEnter={() => handleStageHover(stage)}
                    disabled={stage.isLocked}
                    className={`
                      relative w-20 h-20 md:w-24 md:h-24 rounded-xl 
                      flex items-center justify-center
                      transition-all duration-300
                      ${stage.isCompleted 
                        ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                        : stage.isActive 
                          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.6)]' 
                          : stage.isLocked 
                            ? 'bg-gradient-to-br from-slate-500 via-gray-600 to-slate-700 cursor-not-allowed shadow-lg opacity-80' 
                            : 'bg-gradient-to-br from-sky-400 via-blue-500 to-sky-600 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                      }
                    `}
                    style={{
                      border: stage.isCompleted 
                        ? '3px solid rgba(52,211,153,0.8)' 
                        : stage.isActive 
                          ? '3px solid rgba(251,191,36,0.8)'
                          : stage.isLocked
                            ? '3px solid rgba(100,116,139,0.5)'
                            : '3px solid rgba(125,211,252,0.6)',
                    }}
                    whileHover={!stage.isLocked ? { 
                      scale: 1.15, 
                      rotate: [0, -3, 3, 0],
                      transition: { rotate: { duration: 0.3 } }
                    } : {}}
                    whileTap={!stage.isLocked ? { scale: 0.92 } : {}}
                    animate={stage.isActive ? {
                      boxShadow: [
                        '0 0 20px rgba(245,158,11,0.4)',
                        '0 0 35px rgba(245,158,11,0.7)',
                        '0 0 20px rgba(245,158,11,0.4)',
                      ],
                    } : {}}
                    transition={stage.isActive ? {
                      boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    } : {}}
                  >
                    {/* Inner glow for active */}
                    {stage.isActive && (
                      <motion.div
                        className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/30 to-transparent"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Sparkle decorations for completed */}
                    {stage.isCompleted && (
                      <>
                        <motion.div
                          className="absolute -top-1 -right-1"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-1 -left-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Crown className="w-4 h-4 text-yellow-300 drop-shadow-lg" />
                        </motion.div>
                      </>
                    )}

                    {/* Lock icon or Stage icon */}
                    {stage.isLocked ? (
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="w-8 h-8 md:w-10 md:h-10 text-white/70 drop-shadow" />
                      </motion.div>
                    ) : (
                      <motion.img 
                        src={stage.icon} 
                        alt={stage.name}
                        className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-lg"
                        animate={stage.isActive ? { y: [0, -4, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.button>

                  {/* Progress ring for active stages */}
                  {stage.isActive && stage.progress > 0 && stage.progress < 100 && (
                    <svg 
                      className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                      />
                      <motion.circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="rgba(255,200,50,0.9)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - stage.progress / 100) }}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                  )}
                </div>

                {/* Stage label with fantasy styling */}
                <motion.div
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + displayIndex * 0.2 }}
                >
                  <div className={`
                    px-3 py-1 rounded-full backdrop-blur-sm
                    ${stage.isLocked 
                      ? 'bg-slate-800/60 text-slate-300' 
                      : stage.isActive
                        ? 'bg-amber-900/70 text-amber-100 border border-amber-500/50'
                        : stage.isCompleted
                          ? 'bg-emerald-900/70 text-emerald-100 border border-emerald-500/50'
                          : 'bg-sky-900/70 text-sky-100'
                    }
                  `}>
                    <p className="text-sm font-bold drop-shadow">
                      {stage.name}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerticalGameMap;
