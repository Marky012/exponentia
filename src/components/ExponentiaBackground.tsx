import { motion } from 'framer-motion';
import exponentiaLight from '@/assets/exponentia-light.png';

interface ExponentiaBackgroundProps {
  overlayOpacity?: number;
}

const ExponentiaBackground = ({ overlayOpacity = 0.6 }: ExponentiaBackgroundProps) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${exponentiaLight})` }}
      />
      
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/70" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          bottom: '-5%',
          right: '-5%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default ExponentiaBackground;