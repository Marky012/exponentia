import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Lock, ChevronLeft, ChevronRight, Play, Swords, Trophy, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEffects } from '@/utils/soundEffects';
import { SettingsMenu } from '@/components/SettingsMenu';

// Import stage images
import map1Icon from '@/assets/map1.png';
import map2Icon from '@/assets/map2.png';
import map3Icon from '@/assets/map3.png';
import map4Icon from '@/assets/map4.png';

interface Stage {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  route: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  progress: number;
  accentColor: string;
  bgGradient: string;
}

const HubCarousel = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels, playerGender, unlockQuizLevels } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isFemale = playerGender === 'female';
  
  const allGemsEarned = laws.every(law => law.gemEarned);
  const allQuizzesCompleted = quizLevels.every(level => level.completed);
  
  // Unlock quiz levels when all gems are earned
  useEffect(() => {
    if (allGemsEarned && !quizLevels[0].unlocked) {
      unlockQuizLevels();
    }
  }, [allGemsEarned, quizLevels, unlockQuizLevels]);
  
  const lawsProgress = Math.round((laws.filter(law => law.gemEarned).length / laws.length) * 100);
  const quizProgress = Math.round((quizLevels.filter(level => level.completed).length / quizLevels.length) * 100);

  const stages: Stage[] = [
    {
      id: 1,
      name: 'The Beginning',
      subtitle: 'Chapter I',
      description: 'Meet Elexia and learn about the threat to Exponentia. Your journey begins here.',
      icon: map1Icon,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
      progress: introCompleted ? 100 : 0,
      accentColor: isFemale ? 'from-pink-500 to-rose-600' : 'from-cyan-400 to-blue-600',
      bgGradient: isFemale ? 'from-pink-900/40 via-rose-800/30 to-pink-900/40' : 'from-cyan-900/40 via-blue-800/30 to-cyan-900/40',
    },
    {
      id: 2,
      name: 'Training Grounds',
      subtitle: 'Chapter II',
      description: 'Master the 8 Laws of Exponents. Collect gems to unlock the Battle Arena.',
      icon: map2Icon,
      route: '/laws',
      isCompleted: allGemsEarned,
      isActive: introCompleted && !allGemsEarned,
      isLocked: !introCompleted,
      progress: lawsProgress,
      accentColor: isFemale ? 'from-fuchsia-500 to-pink-600' : 'from-emerald-400 to-teal-600',
      bgGradient: isFemale ? 'from-fuchsia-900/40 via-pink-800/30 to-fuchsia-900/40' : 'from-emerald-900/40 via-teal-800/30 to-emerald-900/40',
    },
    {
      id: 3,
      name: 'Battle Arena',
      subtitle: 'Chapter III',
      description: 'Face the Nullers in combat! Use your exponent powers to defeat them.',
      icon: map3Icon,
      route: '/quiz-arena',
      isCompleted: allQuizzesCompleted,
      isActive: allGemsEarned && !allQuizzesCompleted,
      isLocked: !allGemsEarned,
      progress: quizProgress,
      accentColor: isFemale ? 'from-rose-500 to-red-600' : 'from-orange-400 to-red-600',
      bgGradient: isFemale ? 'from-rose-900/40 via-red-800/30 to-rose-900/40' : 'from-orange-900/40 via-red-800/30 to-orange-900/40',
    },
    {
      id: 4,
      name: 'The Kingdom',
      subtitle: 'Final Chapter',
      description: 'Victory awaits! See your achievements and celebrate your triumph.',
      icon: map4Icon,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
      progress: allQuizzesCompleted ? 100 : 0,
      accentColor: isFemale ? 'from-amber-400 to-yellow-500' : 'from-yellow-400 to-amber-500',
      bgGradient: isFemale ? 'from-amber-900/40 via-yellow-800/30 to-amber-900/40' : 'from-yellow-900/40 via-amber-800/30 to-yellow-900/40',
    },
  ];

  // Auto-focus on the first active/unlocked stage
  useEffect(() => {
    const activeIndex = stages.findIndex(s => s.isActive);
    if (activeIndex !== -1) {
      setCurrentIndex(activeIndex);
    }
  }, [introCompleted, allGemsEarned, allQuizzesCompleted]);

  const navigateTo = (direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    soundEffects.playHover();
    
    if (direction === 'prev') {
      setCurrentIndex(prev => (prev === 0 ? stages.length - 1 : prev - 1));
    } else {
      setCurrentIndex(prev => (prev === stages.length - 1 ? 0 : prev + 1));
    }
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleStageClick = (stage: Stage) => {
    if (stage.isLocked) {
      soundEffects.playLocked();
      return;
    }
    soundEffects.playMapSelect();
    navigate(stage.route);
  };

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + stages.length) % stages.length);
    const adjustedDiff = normalizedDiff > stages.length / 2 ? normalizedDiff - stages.length : normalizedDiff;
    
    // Base transforms
    let translateX = adjustedDiff * 85; // Horizontal spacing percentage
    let translateZ = -Math.abs(adjustedDiff) * 150; // Depth
    let rotateY = adjustedDiff * -25; // Rotation angle
    let scale = 1 - Math.abs(adjustedDiff) * 0.15;
    let opacity = 1 - Math.abs(adjustedDiff) * 0.3;
    let zIndex = 10 - Math.abs(adjustedDiff);

    // Limit visible cards
    if (Math.abs(adjustedDiff) > 1) {
      opacity = 0;
      scale = 0.7;
    }

    return {
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  const getStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1: return <Play className="w-6 h-6" />;
      case 2: return <BookOpen className="w-6 h-6" />;
      case 3: return <Swords className="w-6 h-6" />;
      case 4: return <Trophy className="w-6 h-6" />;
      default: return null;
    }
  };

  const currentStage = stages[currentIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${currentStage.bgGradient} transition-all duration-700`}
        />
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${isFemale ? 'bg-pink-400/30' : 'bg-cyan-400/30'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl md:text-2xl font-orbitron font-bold text-foreground drop-shadow-lg">
            EXPONENTIA
          </h1>
          <p className="text-[10px] text-muted-foreground">Choose Your Path</p>
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
            className="w-9 h-9 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card/70 border border-border/50"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <SettingsMenu />
        </motion.div>
      </div>

      {/* Stage Indicators */}
      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center gap-2 px-4">
        {stages.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => {
              if (!isAnimating) {
                soundEffects.playHover();
                setCurrentIndex(index);
              }
            }}
            className={`
              h-2 rounded-full transition-all duration-300
              ${index === currentIndex 
                ? `w-8 bg-gradient-to-r ${stage.accentColor}` 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }
            `}
          />
        ))}
      </div>

      {/* 3D Carousel Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div className="relative w-full max-w-md h-[65vh] flex items-center justify-center">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              className="absolute w-72 md:w-80"
              style={{
                ...getCardStyle(index),
                transformStyle: 'preserve-3d',
              }}
              initial={false}
              animate={getCardStyle(index)}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                duration: 0.5 
              }}
            >
              {/* Card */}
              <motion.div
                onClick={() => index === currentIndex && handleStageClick(stage)}
                className={`
                  relative rounded-3xl overflow-hidden cursor-pointer
                  backdrop-blur-md border-2 transition-colors duration-300
                  ${stage.isLocked 
                    ? 'bg-muted/40 border-muted-foreground/20' 
                    : stage.isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : stage.isActive
                        ? 'bg-card/60 border-primary/50'
                        : 'bg-card/40 border-border/40'
                  }
                `}
                whileHover={index === currentIndex && !stage.isLocked ? { scale: 1.02 } : {}}
                whileTap={index === currentIndex && !stage.isLocked ? { scale: 0.98 } : {}}
              >
                {/* Card Glow Effect */}
                {stage.isActive && index === currentIndex && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${stage.accentColor} opacity-20 blur-xl`}
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Stage Image Section */}
                <div className="relative h-44 md:h-52 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b ${stage.bgGradient}`} />
                  
                  {stage.isLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="w-16 h-16 text-muted-foreground/60" />
                      </motion.div>
                    </div>
                  ) : (
                    <motion.img
                      src={stage.icon}
                      alt={stage.name}
                      className="absolute inset-0 w-full h-full object-contain p-6"
                      animate={stage.isActive && index === currentIndex ? { 
                        y: [0, -8, 0],
                        rotate: [0, 2, 0, -2, 0],
                      } : {}}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  )}

                  {/* Chapter Badge */}
                  <div className={`
                    absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
                    backdrop-blur-sm bg-background/30 text-foreground/90
                  `}>
                    {stage.subtitle}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {stage.isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                    ) : stage.isActive ? (
                      <motion.div 
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${stage.accentColor} flex items-center justify-center shadow-lg`}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {getStageIcon(stage.id)}
                      </motion.div>
                    ) : stage.isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className={`
                      text-lg md:text-xl font-orbitron font-bold
                      ${stage.isLocked ? 'text-muted-foreground' : 'text-foreground'}
                    `}>
                      {stage.name}
                    </h3>
                    <p className={`
                      text-xs md:text-sm mt-1 leading-relaxed
                      ${stage.isLocked ? 'text-muted-foreground/60' : 'text-muted-foreground'}
                    `}>
                      {stage.isLocked ? 'Complete previous stages to unlock' : stage.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {!stage.isLocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{stage.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${stage.accentColor} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={stage.isLocked ? "secondary" : "default"}
                    className={`
                      w-full mt-2 font-semibold transition-all duration-300
                      ${!stage.isLocked && `bg-gradient-to-r ${stage.accentColor} hover:opacity-90 text-white border-0`}
                    `}
                    disabled={stage.isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStageClick(stage);
                    }}
                  >
                    {stage.isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Locked
                      </>
                    ) : stage.isCompleted ? (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Revisit
                      </>
                    ) : (
                      <>
                        {getStageIcon(stage.id)}
                        <span className="ml-2">
                          {stage.isActive ? 'Continue' : 'Enter'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4 px-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo('prev')}
          disabled={isAnimating}
          className="w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo('next')}
          disabled={isAnimating}
          className="w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Touch/Swipe hint for mobile */}
      <motion.p
        className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Swipe or use arrows to navigate
      </motion.p>
    </div>
  );
};

export default HubCarousel;
