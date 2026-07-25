import { motion } from 'framer-motion';
import exponentiaLight from '@/assets/exponentia-light.png';
import { MATH_SYMBOLS } from '@/constants/mathSymbols';

interface ExponentiaBackgroundProps {
  overlayOpacity?: number;
}

const ExponentiaBackground = ({ overlayOpacity = 0.6 }: ExponentiaBackgroundProps) => {
  return (
    <motion.div 
      className="fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background image with smooth transition */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url(${exponentiaLight})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      {/* Gradient overlay for readability - uses theme colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/70 transition-colors duration-500" />
      
      {/* Animated gradient orbs - uses theme colors */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10 transition-colors duration-500"
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
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10 transition-colors duration-500"
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
      
      {/* Floating math symbols */}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-xs font-orbitron font-bold text-primary/20 select-none pointer-events-none transition-colors duration-500"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            textShadow: '0 0 6px hsl(var(--primary))',
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
        >
          {MATH_SYMBOLS[i % MATH_SYMBOLS.length]}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ExponentiaBackground;