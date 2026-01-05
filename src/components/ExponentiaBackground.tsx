import { motion } from 'framer-motion';
import elexiaHopeful from '@/assets/elexia-hopeful.png';

interface ExponentiaBackgroundProps {
  overlayOpacity?: number;
}

const ExponentiaBackground = ({ overlayOpacity = 0.6 }: ExponentiaBackgroundProps) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
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
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
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
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Happy Elexia character - positioned bottom right */}
      <motion.div
        className="absolute bottom-0 right-0 w-64 md:w-80 lg:w-96 pointer-events-none"
        style={{ opacity: 0.25 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: 0.25, 
          y: [0, -10, 0],
        }}
        transition={{
          opacity: { duration: 1 },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }
        }}
      >
        <img 
          src={elexiaHopeful} 
          alt="Elexia" 
          className="w-full h-auto drop-shadow-2xl"
        />
      </motion.div>
      
      {/* Floating particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
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
      
      {/* Overlay for readability */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity * 0.3})` }}
      />
    </div>
  );
};

export default ExponentiaBackground;