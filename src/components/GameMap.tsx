import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { BookOpen, Swords, Trophy, ScrollText } from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
}

const GameMap = () => {
  const navigate = useNavigate();
  const { introCompleted, laws, quizLevels } = useGameStore();
  
  const allLawsCompleted = laws.every(law => law.completed);
  const allQuizzesCompleted = quizLevels.every(level => level.completed);
  
  const stages: Stage[] = [
    {
      id: 1,
      name: 'Introduction',
      description: 'Meet Elexia and begin your journey',
      icon: <BookOpen className="w-6 h-6" />,
      route: '/intro',
      isCompleted: introCompleted,
      isActive: !introCompleted,
      isLocked: false,
    },
    {
      id: 2,
      name: 'Training',
      description: 'Learn the 8 Laws of Exponents',
      icon: <ScrollText className="w-6 h-6" />,
      route: '/laws',
      isCompleted: allLawsCompleted,
      isActive: introCompleted && !allLawsCompleted,
      isLocked: !introCompleted,
    },
    {
      id: 3,
      name: 'Quiz Battle',
      description: 'Test your knowledge in combat',
      icon: <Swords className="w-6 h-6" />,
      route: '/laws',
      isCompleted: allQuizzesCompleted,
      isActive: allLawsCompleted && !allQuizzesCompleted,
      isLocked: !allLawsCompleted,
    },
    {
      id: 4,
      name: 'Victory',
      description: 'View your achievements & report',
      icon: <Trophy className="w-6 h-6" />,
      route: '/statistics',
      isCompleted: allQuizzesCompleted,
      isActive: allQuizzesCompleted,
      isLocked: !allQuizzesCompleted,
    },
  ];

  const handleStageClick = (stage: Stage) => {
    if (!stage.isLocked) {
      navigate(stage.route);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8 px-4">
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
            {/* Connecting Line (except for last item) */}
            {index < stages.length - 1 && (
              <motion.div
                className="absolute top-10 left-full w-[calc(100%-2rem)] md:w-24 lg:w-32 h-1 -z-10"
                style={{ marginLeft: '1rem' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
              >
                <div 
                  className={`h-full rounded-full ${
                    stages[index].isCompleted 
                      ? 'bg-gradient-to-r from-primary to-primary/50' 
                      : 'bg-gradient-to-r from-muted to-muted/50'
                  }`}
                  style={{
                    backgroundSize: '10px 100%',
                    backgroundImage: stages[index].isCompleted 
                      ? 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 6px, transparent 6px, transparent 10px)'
                      : 'repeating-linear-gradient(90deg, hsl(var(--muted)) 0px, hsl(var(--muted)) 6px, transparent 6px, transparent 10px)'
                  }}
                />
              </motion.div>
            )}
            {/* Stage Circle */}
            <motion.button
              onClick={() => handleStageClick(stage)}
              disabled={stage.isLocked}
              className={`
                relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 
                flex items-center justify-center
                transition-all duration-300
                ${stage.isCompleted 
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/50' 
                  : stage.isActive 
                    ? 'bg-secondary border-primary text-primary animate-pulse shadow-lg shadow-primary/30' 
                    : stage.isLocked 
                      ? 'bg-muted border-muted-foreground/30 text-muted-foreground cursor-not-allowed opacity-50' 
                      : 'bg-card border-border text-foreground hover:border-primary hover:shadow-lg'
                }
              `}
              whileHover={!stage.isLocked ? { scale: 1.1 } : {}}
              whileTap={!stage.isLocked ? { scale: 0.95 } : {}}
            >
              {/* Glow effect for active stage */}
              {stage.isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Completion checkmark */}
              {stage.isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              {/* Lock icon for locked stages */}
              {stage.isLocked ? (
                <span className="text-xl">🔒</span>
              ) : (
                stage.icon
              )}
            </motion.button>

            {/* Stage Number */}
            <motion.div
              className={`
                absolute -top-1 -left-1 w-6 h-6 rounded-full 
                flex items-center justify-center text-xs font-bold
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

            {/* Stage Label */}
            <motion.div
              className="text-center mt-3 w-24"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
            >
              <p className={`font-semibold text-xs md:text-sm ${stage.isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.name}
              </p>
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
