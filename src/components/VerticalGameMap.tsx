import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Lock, Star, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEffects } from '@/utils/soundEffects';
import { SettingsMenu } from '@/components/SettingsMenu';

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
  
  const lawsProgress = (laws.filter(law => law.gemEarned).length / laws.length) * 100;
  const quizProgress = (quizLevels.filter(level => level.completed).length / quizLevels.length) * 100;
  
  const getStars = (isCompleted: boolean, progress: number): number => {
    if (!isCompleted && progress === 0) return 0;
    if (isCompleted) return 3;
    if (progress >= 66) return 2;
    if (progress >= 33) return 1;
    return 0;
  };

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

  useEffect(() => {
    const currentUnlockStates = stages.map(s => !s.isLocked);
    
    if (previousStagesRef.current.length > 0) {
      currentUnlockStates.forEach((isUnlocked, index) => {
        if (isUnlocked && !previousStagesRef.current[index]) {
          triggerUnlockAnimation(index);
        }
      });
    }
    
    previousStagesRef.current = currentUnlockStates;
  }, [introCompleted, allGemsEarned, allQuizzesCompleted]);

  const triggerUnlockAnimation = (stageIndex: number) => {
    setUnlockingStage(stageIndex);
    soundEffects.playUnlock();
    
    const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];
    const newParticles: UnlockParticle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
    
    setTimeout(() => {
      setUnlockingStage(null);
      setParticles([]);
    }, 1000);
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

  const displayStages = [...stages].reverse();

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${exponentiaBg})`,
        backgroundSize: 'cover',
      }}
    >
      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-sky-900/30" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl md:text-2xl font-orbitron font-bold text-sky-100 drop-shadow-lg">
            EXPONENTIA
          </h1>
          <p className="text-[10px] text-sky-200/80">Your Quest Awaits</p>
        </motion.div>

        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundEffects.playClick();
              navigate('/statistics');
            }}
            className="w-9 h-9 rounded-full bg-sky-900/50 backdrop-blur-sm text-sky-100 hover:bg-sky-800/60 border border-sky-400/30"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <SettingsMenu />
        </motion.div>
      </div>

      {/* Map Content */}
      <div className="relative z-10 h-screen pt-16 pb-4 px-4 overflow-y-auto">
        <div className="max-w-sm mx-auto h-full flex flex-col justify-around py-4 relative">
          
          {/* Curving Dotted Path SVG - behind all cards */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
                <stop offset="50%" stopColor="rgba(52,211,153,0.7)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0.5)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Curving adventure path */}
            <motion.path
              d="M 50 8
                 C 25 12, 20 18, 35 25
                 S 65 28, 50 35
                 C 30 40, 25 48, 40 52
                 S 70 55, 50 62
                 C 25 68, 20 75, 40 80
                 S 75 85, 50 92"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="0.8"
              strokeDasharray="2 1.5"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.5, delay: 0.3, ease: "easeOut" }}
            />
            
            {/* Animated traveling dot along the path */}
            <motion.circle
              r="1"
              fill="rgba(56,189,248,1)"
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            >
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path="M 50 8 C 25 12, 20 18, 35 25 S 65 28, 50 35 C 30 40, 25 48, 40 52 S 70 55, 50 62 C 25 68, 20 75, 40 80 S 75 85, 50 92"
              />
            </motion.circle>
          </svg>
          
          {displayStages.map((stage, displayIndex) => {
            const actualIndex = stages.length - 1 - displayIndex;
            const isUnlocking = unlockingStage === actualIndex;
            const isLeft = displayIndex % 2 === 0;
            const isLast = displayIndex === displayStages.length - 1;
            
            return (
              <motion.div
                key={stage.id}
                className={`relative flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                style={{ zIndex: 1 }}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + displayIndex * 0.1,
                  type: "spring",
                  stiffness: 150
                }}
              >
                
                {/* Stage Icon Button */}
                <motion.button
                  onClick={() => handleStageClick(stage, actualIndex)}
                  onMouseEnter={() => handleStageHover(stage)}
                  disabled={stage.isLocked}
                  className={`
                    relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shrink-0
                    backdrop-blur-sm transition-all duration-300
                    ${stage.isCompleted 
                      ? 'bg-emerald-500/30 border-2 border-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                      : stage.isActive 
                        ? 'bg-sky-500/30 border-2 border-sky-400/70 shadow-[0_0_25px_rgba(56,189,248,0.5)]' 
                        : stage.isLocked 
                          ? 'bg-slate-600/40 border-2 border-slate-500/50 cursor-not-allowed' 
                          : 'bg-sky-500/25 border-2 border-sky-400/60'
                    }
                  `}
                  whileHover={!stage.isLocked ? { scale: 1.08 } : {}}
                  whileTap={!stage.isLocked ? { scale: 0.95 } : {}}
                  animate={stage.isActive ? {
                    boxShadow: [
                      '0 0 20px rgba(56,189,248,0.4)',
                      '0 0 35px rgba(56,189,248,0.7)',
                      '0 0 20px rgba(56,189,248,0.4)',
                    ],
                  } : {}}
                  transition={stage.isActive ? {
                    boxShadow: { duration: 1.5, repeat: Infinity }
                  } : {}}
                >
                  {/* Unlock particles */}
                  <AnimatePresence>
                    {isUnlocking && particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute rounded-full pointer-events-none z-20"
                        style={{
                          width: particle.size,
                          height: particle.size,
                          backgroundColor: particle.color,
                          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: particle.x, y: particle.y, opacity: 0 }}
                        transition={{ duration: 0.7, delay: particle.delay }}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Unlock flash */}
                  <AnimatePresence>
                    {isUnlocking && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-sky-400/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>

                  {stage.isLocked ? (
                    <Lock className="w-8 h-8 text-slate-300/70" />
                  ) : (
                    <motion.img 
                      src={stage.icon} 
                      alt={stage.name}
                      className="w-14 h-14 md:w-16 md:h-16 object-contain"
                      animate={stage.isActive ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Progress ring */}
                  {stage.isActive && stage.progress > 0 && stage.progress < 100 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%" cy="50%" r="45%"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="3"
                      />
                      <motion.circle
                        cx="50%" cy="50%" r="45%"
                        fill="none"
                        stroke="rgba(56,189,248,0.9)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        pathLength="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: stage.progress / 100 }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                  )}
                </motion.button>

                {/* Stage Info Card */}
                <div className={`
                  flex-1 p-3 rounded-xl backdrop-blur-sm
                  ${stage.isCompleted 
                    ? 'bg-emerald-900/30 border border-emerald-400/40' 
                    : stage.isActive 
                      ? 'bg-sky-900/40 border border-sky-400/50' 
                      : stage.isLocked 
                        ? 'bg-slate-800/30 border border-slate-500/30' 
                        : 'bg-sky-900/30 border border-sky-400/40'
                  }
                `}>
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3].map((starNum) => (
                      <Star 
                        key={starNum}
                        className={`w-4 h-4 ${
                          stage.stars >= starNum 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-slate-500/40 fill-slate-500/20'
                        }`}
                      />
                    ))}
                  </div>

                  <h3 className={`text-sm font-bold mb-0.5 ${
                    stage.isLocked ? 'text-slate-400' : 'text-white'
                  }`}>
                    {stage.name}
                  </h3>
                  <p className={`text-xs ${
                    stage.isLocked ? 'text-slate-500' : 'text-sky-200/80'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Progress bar */}
                  {stage.isActive && stage.progress > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-sky-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <p className="text-[10px] text-sky-300/70 mt-0.5">
                        {Math.round(stage.progress)}%
                      </p>
                    </div>
                  )}

                  {stage.isCompleted && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 rounded text-[10px] text-emerald-300">
                      ✓ Complete
                    </div>
                  )}
                </div>

                {/* Stage Number */}
                <motion.div
                  className={`
                    absolute ${isLeft ? '-left-3' : '-right-3'} top-1/2 -translate-y-1/2
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${stage.isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : stage.isActive 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-500/60 text-slate-300'
                    }
                  `}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + displayIndex * 0.1 }}
                >
                  {stage.id}
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
