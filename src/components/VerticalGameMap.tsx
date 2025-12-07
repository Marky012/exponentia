import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Lock, Star, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const VerticalGameMap = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels } = useGameStore();
  const [showUnlockEffect, setShowUnlockEffect] = useState<number | null>(null);
  
  const allLawsCompleted = laws.every(law => law.completed);
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

  const handleStageClick = (stage: Stage) => {
    if (!stage.isLocked) {
      navigate(stage.route);
    }
  };

  // Reversed for display (bottom to top becomes top to bottom in scroll)
  const displayStages = [...stages].reverse();

  // Define winding path positions for each stage (alternating left-right for zigzag effect)
  const getStagePosition = (index: number): { marginLeft: string; marginRight: string } => {
    // Stages zigzag from top to bottom in display order
    const positions = [
      { marginLeft: '45%', marginRight: '0' },    // Stage 4 (Kingdom) - right side
      { marginLeft: '0', marginRight: '45%' },    // Stage 3 (Arena) - left side
      { marginLeft: '45%', marginRight: '0' },    // Stage 2 (Training) - right side
      { marginLeft: '0', marginRight: '45%' },    // Stage 1 (Beginning) - left side
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
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/40" />

      {/* Title */}
      <motion.div
        className="absolute top-4 left-4 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-primary drop-shadow-lg">
          EXPONENTIA
        </h1>
        <p className="text-xs text-foreground/80 drop-shadow">Your Quest Awaits</p>
      </motion.div>

      {/* Statistics Button */}
      <motion.div 
        className="absolute top-16 right-4 z-20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/statistics')}
          className="gap-2 shadow-lg"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Stats</span>
        </Button>
      </motion.div>

      {/* Decorative elements - Trees and Bushes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Decorative clouds */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-16 h-8 bg-white/60 rounded-full blur-sm"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[10%] w-20 h-10 bg-white/50 rounded-full blur-sm"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[60%] left-[8%] w-12 h-6 bg-white/40 rounded-full blur-sm"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Winding Path SVG */}
      <svg 
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Main winding path */}
        <motion.path
          d="M 35 90 Q 15 80 35 70 Q 55 60 65 50 Q 85 40 65 30 Q 45 20 35 15"
          fill="none"
          stroke="hsl(35, 60%, 50%)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Path border/shadow */}
        <path
          d="M 35 90 Q 15 80 35 70 Q 55 60 65 50 Q 85 40 65 30 Q 45 20 35 15"
          fill="none"
          stroke="hsl(35, 40%, 35%)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>

      {/* Stage Nodes */}
      <div className="relative z-10 min-h-screen py-24 px-4">
        <div className="relative max-w-md mx-auto h-[80vh] flex flex-col justify-between">
          {displayStages.map((stage, displayIndex) => {
            const position = getStagePosition(displayIndex);
            
            return (
              <motion.div
                key={stage.id}
                className="relative"
                style={{ 
                  marginLeft: position.marginLeft,
                  marginRight: position.marginRight,
                }}
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + displayIndex * 0.15,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {/* Stars above stage */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                  {[1, 2, 3].map((starNum) => (
                    <motion.div
                      key={starNum}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: stage.stars >= starNum ? 1 : 0.6, 
                        rotate: 0 
                      }}
                      transition={{ delay: 0.8 + displayIndex * 0.15 + starNum * 0.1 }}
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          stage.stars >= starNum 
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg' 
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Stage Button */}
                <motion.button
                  onClick={() => handleStageClick(stage)}
                  disabled={stage.isLocked}
                  className={`
                    relative w-24 h-24 md:w-28 md:h-28 rounded-2xl 
                    flex items-center justify-center
                    transition-all duration-300 shadow-xl
                    ${stage.isCompleted 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 border-4 border-green-300' 
                      : stage.isActive 
                        ? 'bg-gradient-to-br from-primary to-primary/80 border-4 border-primary/50 animate-pulse' 
                        : stage.isLocked 
                          ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-gray-500 cursor-not-allowed opacity-70' 
                          : 'bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-blue-300'
                    }
                  `}
                  whileHover={!stage.isLocked ? { scale: 1.1, rotate: [-2, 2, -2, 0] } : {}}
                  whileTap={!stage.isLocked ? { scale: 0.95 } : {}}
                >
                  {/* Glow effect for active */}
                  {stage.isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-primary/40 blur-xl -z-10"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Sparkle effect for completed */}
                  {stage.isCompleted && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
                    </motion.div>
                  )}

                  {/* Lock icon or Stage icon */}
                  {stage.isLocked ? (
                    <Lock className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
                  ) : (
                    <img 
                      src={stage.icon} 
                      alt={stage.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
                    />
                  )}
                </motion.button>

                {/* Stage label below */}
                <motion.div
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + displayIndex * 0.15 }}
                >
                  <p className={`text-sm font-bold drop-shadow-lg ${
                    stage.isLocked ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {stage.name}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom decorative grass */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-800/40 to-transparent pointer-events-none" />
    </div>
  );
};

export default VerticalGameMap;
