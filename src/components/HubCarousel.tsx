import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Lock, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEffects } from '@/utils/soundEffects';
import { SettingsMenu } from '@/components/SettingsMenu';
import ExponentiaBackground from '@/components/ExponentiaBackground';

// Import new hub floating island images
import hubBeginning from '@/assets/hub-beginning.png';
import hubTraining from '@/assets/hub-training.png';
import hubArena from '@/assets/hub-arena.png';
import hubVictory from '@/assets/hub-victory.png';

interface Stage {
  id: number;
  name: string;
  icon: string;
  route: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
}

const HubCarousel = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels, playerGender, unlockQuizLevels } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isDraggingRef = useRef(false);
  const [hasEntered, setHasEntered] = useState(false);
  const dragStartX = useRef(0);
  const dragThreshold = 50; // Minimum drag distance to trigger navigation
  

  const allGemsEarned = laws.every(law => law.gemEarned);
  const allQuizzesCompleted = quizLevels.every(level => level.completed);

  // Unlock quiz levels when all gems are earned
  useEffect(() => {
    if (allGemsEarned && !quizLevels[0].unlocked) {
      unlockQuizLevels();
    }
  }, [allGemsEarned, quizLevels, unlockQuizLevels]);

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === 'ArrowLeft') {
        navigateTo('prev');
      } else if (e.key === 'ArrowRight') {
        navigateTo('next');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating]);

  const stages: Stage[] = [
    {
      id: 1,
      name: 'The Beginning',
      icon: hubBeginning,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
    },
    {
      id: 2,
      name: 'Training Grounds',
      icon: hubTraining,
      route: '/laws',
      isCompleted: allGemsEarned,
      isActive: introCompleted && !allGemsEarned,
      isLocked: !introCompleted,
    },
    {
      id: 3,
      name: 'Battle Arena',
      icon: hubArena,
      route: '/quiz-arena',
      isCompleted: allQuizzesCompleted,
      isActive: allGemsEarned && !allQuizzesCompleted,
      isLocked: !allGemsEarned,
    },
    {
      id: 4,
      name: 'The Victory',
      icon: hubVictory,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
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

  const handleStageClick = (stage: Stage, index: number) => {
    if (wasDrag.current) {
      wasDrag.current = false;
      return;
    }
    if (index !== currentIndex) {
      soundEffects.playHover();
      setCurrentIndex(index);
      return;
    }
    if (stage.isLocked) {
      soundEffects.playLocked();
      return;
    }
    soundEffects.playMapSelect();
    navigate(stage.route);
  };

  const wasDrag = useRef(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isAnimating) return;
    wasDrag.current = false;
    isDraggingRef.current = true;
    if ('touches' in e) {
      dragStartX.current = e.touches[0].clientX;
    } else {
      dragStartX.current = e.clientX;
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    let endX: number;
    if ('changedTouches' in e) {
      endX = e.changedTouches[0].clientX;
    } else {
      endX = e.clientX;
    }
    
    const deltaX = endX - dragStartX.current;
    
    if (Math.abs(deltaX) > dragThreshold) {
      wasDrag.current = true;
      if (deltaX > 0) {
        navigateTo('prev');
      } else {
        navigateTo('next');
      }
    }
  };

  const handleDragCancel = () => {
    isDraggingRef.current = false;
  };

  // Cylinder carousel - true cylinder with back island behind front
  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + stages.length) % stages.length);
    const adjustedDiff = normalizedDiff > stages.length / 2 ? normalizedDiff - stages.length : normalizedDiff;

    // True cylinder: 4 items at 90 degrees apart (360/4)
    const angle = adjustedDiff * 90;
    const radius = 220; // Distance from center
    const translateX = Math.sin((angle * Math.PI) / 180) * radius;
    const translateZ = Math.cos((angle * Math.PI) / 180) * radius - radius;
    // Increased tilt for side islands for better visibility
    const rotateY = -angle * 0.6; // Less rotation so sides face more towards player
    
    // Scale and opacity: front = full, sides = reduced, back = hidden behind
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;
    
    if (Math.abs(adjustedDiff) === 0) {
      // Front - focused
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (Math.abs(adjustedDiff) === 1) {
      // Sides - more visible with better tilt
      scale = 0.65;
      opacity = 0.6;
      zIndex = 5;
    } else {
      // Back - directly behind, mostly hidden
      scale = 0.45;
      opacity = 0.12;
      zIndex = 1;
    }

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  // Get floating animation for each island (different speeds)
  const getFloatAnimation = (index: number) => {
    const speeds = [4, 3.5, 4.5, 3]; // Different durations for variety
    const amplitudes = [12, 8, 10, 6]; // Different float heights
    const delays = [0, 0.5, 1, 1.5]; // Stagger start times
    
    return {
      y: [0, -amplitudes[index % 4], 0],
      transition: {
        duration: speeds[index % 4],
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: delays[index % 4],
      }
    };
  };

  // Entrance animation variants
  const entranceVariants = {
    hidden: (_index: number) => ({
      opacity: 0,
      y: 150,
      scale: 0.3,
      rotateX: 45,
    }),
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        delay: index * 0.15,
      }
    })
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Exponentia Background */}
      <ExponentiaBackground />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-4 flex items-center justify-between safe-area-inset-top">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-foreground drop-shadow-lg">
            EXPONENTIA
          </h1>
          <p className="text-xs text-muted-foreground">Choose Your Destiny</p>
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

      {/* Stage Indicators with entrance animation */}
      <motion.div 
        className="absolute top-24 left-0 right-0 z-20 flex justify-center gap-3 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
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
              h-2.5 rounded-full transition-all duration-300
              ${index === currentIndex 
                ? 'w-10 bg-primary shadow-lg shadow-primary/30' 
                : 'w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }
            `}
          />
        ))}
      </motion.div>

      {/* 3D Carousel Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-grab"
        style={{ perspective: '1000px' }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragCancel}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        <div 
          className="relative w-full h-[70vh] flex items-center justify-center select-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {stages.map((stage, index) => {
            const cardStyle = getCardStyle(index);
            const floatAnim = getFloatAnimation(index);
            
            return (
              <motion.div
                key={stage.id}
                className="absolute flex flex-col items-center"
                custom={index}
                variants={entranceVariants}
                initial="hidden"
                animate={hasEntered ? "visible" : "hidden"}
                style={{
                  transformStyle: 'preserve-3d',
                  zIndex: cardStyle.zIndex,
                }}
              >
                {/* Position wrapper for carousel rotation */}
                <motion.div
                  className="flex flex-col items-center cursor-pointer"
                  animate={cardStyle}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30,
                  }}
                  onClick={() => handleStageClick(stage, index)}
                >
                  {/* Stage Label - Above Image */}
                  <motion.h2
                    className={`
                      text-xl md:text-2xl font-orbitron font-bold mb-4 text-center
                      drop-shadow-lg transition-all duration-300
                      ${index === currentIndex 
                        ? 'text-foreground scale-100' 
                        : 'text-muted-foreground/60 scale-90'
                      }
                    `}
                    animate={index === currentIndex ? {
                      textShadow: ['0 0 10px hsl(var(--primary) / 0.3)', '0 0 20px hsl(var(--primary) / 0.5)', '0 0 10px hsl(var(--primary) / 0.3)']
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stage.name}
                  </motion.h2>

                  {/* Floating Island Image with bobbing animation */}
                  <motion.div 
                    className="relative cursor-pointer"
                    animate={floatAnim}
                  >
                    {/* Glow effect for active stage */}
                    {index === currentIndex && !stage.isLocked && (
                      <>
                        {/* Radial glow aura */}
                        <motion.div
                          className="absolute inset-0 rounded-full blur-3xl bg-primary/30"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        
                        {/* Magical particles rising from island */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-primary/80"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              bottom: `${30 + Math.random() * 20}%`,
                              filter: 'blur(1px)',
                            }}
                            animate={{
                              y: [0, -80 - Math.random() * 60],
                              x: [0, (Math.random() - 0.5) * 40],
                              opacity: [0, 0.8, 0],
                              scale: [0.5, 1, 0.3],
                            }}
                            transition={{
                              duration: 2.5 + Math.random() * 1.5,
                              repeat: Infinity,
                              delay: Math.random() * 2,
                              ease: 'easeOut',
                            }}
                          />
                        ))}
                        
                        {/* Sparkle particles */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={`sparkle-${i}`}
                            className="absolute w-1 h-1 rounded-full bg-white"
                            style={{
                              left: `${10 + Math.random() * 80}%`,
                              top: `${10 + Math.random() * 60}%`,
                              boxShadow: '0 0 6px 2px rgba(255,255,255,0.6)',
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1.2, 0],
                            }}
                            transition={{
                              duration: 1.5 + Math.random(),
                              repeat: Infinity,
                              delay: Math.random() * 3,
                            }}
                          />
                        ))}
                        
                        {/* Orbiting magical orbs */}
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={`orb-${i}`}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                              background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
                              left: '50%',
                              top: '50%',
                              marginLeft: '-6px',
                              marginTop: '-6px',
                            }}
                            animate={{
                              x: [
                                Math.cos((i * 120 * Math.PI) / 180) * 100,
                                Math.cos(((i * 120 + 360) * Math.PI) / 180) * 100,
                              ],
                              y: [
                                Math.sin((i * 120 * Math.PI) / 180) * 60,
                                Math.sin(((i * 120 + 360) * Math.PI) / 180) * 60,
                              ],
                              opacity: [0.6, 0.9, 0.6],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: 'linear',
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                      </>
                    )}
                    
                    <motion.img
                      src={stage.icon}
                      alt={stage.name}
                      className={`
                        w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl
                        transition-all duration-300
                        ${stage.isLocked ? 'grayscale brightness-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}
                      `}
                      whileHover={!stage.isLocked && index === currentIndex ? { scale: 1.05 } : {}}
                      whileTap={!stage.isLocked && index === currentIndex ? { scale: 0.98 } : {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStageClick(stage, index);
                      }}
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 20 }}
                    />

                    {/* Lock overlay for locked stages */}
                    {stage.isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="p-4 rounded-full bg-background/60 backdrop-blur-sm"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lock className="w-10 h-10 text-muted-foreground" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>

                  {/* Status Label - Below Image */}
                  <motion.p
                    className={`
                      mt-4 text-sm md:text-base font-medium text-center
                      ${index === currentIndex 
                        ? stage.isLocked 
                          ? 'text-muted-foreground'
                          : stage.isCompleted
                            ? 'text-emerald-400'
                            : 'text-primary'
                        : 'text-muted-foreground/50'
                      }
                    `}
                  >
                    {stage.isLocked 
                      ? '🔒 Locked' 
                      : stage.isCompleted 
                        ? '✨ Completed' 
                        : stage.isActive 
                          ? '▶ Continue' 
                          : 'Enter'
                    }
                  </motion.p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <motion.div 
        className="absolute bottom-20 left-0 right-0 z-20 flex justify-between px-6 md:px-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo('prev')}
          disabled={isAnimating}
          className="w-14 h-14 rounded-full bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo('next')}
          disabled={isAnimating}
          className="w-14 h-14 rounded-full bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Touch/Swipe hint for mobile */}
      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center text-xs text-muted-foreground/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Swipe, drag, or use arrow keys to explore
      </motion.p>
    </div>
  );
};

export default HubCarousel;
