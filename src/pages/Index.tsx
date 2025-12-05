import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const hasStarted = useGameStore((state) => state.hasStarted);

  useEffect(() => {
    // Show boot screen animation then go to map or welcome
    const timer = setTimeout(() => {
      if (hasStarted) {
        navigate('/hub');
      } else {
        navigate('/welcome');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasStarted, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Logo and title */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="relative inline-block mb-6"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <div className="text-8xl font-orbitron font-black text-primary glow-strong">
            E
          </div>
          <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-secondary animate-pulse" />
          <Zap className="absolute -bottom-4 -left-4 w-8 h-8 text-accent animate-pulse" />
        </motion.div>

        <motion.h1
          className="text-6xl font-orbitron font-black mb-4 text-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          EXPONENTIA
        </motion.h1>

        <motion.p
          className="text-xl text-muted-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          The Realm of Exponential Power
        </motion.p>

        <motion.div
          className="mt-8 flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
