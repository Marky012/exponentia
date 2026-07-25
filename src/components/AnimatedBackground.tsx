import { motion } from 'framer-motion';
import { MATH_SYMBOLS } from '@/constants/mathSymbols';

interface AnimatedBackgroundProps {
  theme: 'male' | 'female' | null;
}

const AnimatedBackground = ({ theme }: AnimatedBackgroundProps) => {
  const primaryColor = theme === 'female' 
    ? 'hsl(330, 85%, 65%)' 
    : 'hsl(202, 60%, 65%)';
  const secondaryColor = theme === 'female'
    ? 'hsl(320, 80%, 55%)'
    : 'hsl(190, 70%, 50%)';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: primaryColor }}
        animate={{
          x: ['-20%', '10%', '-20%'],
          y: ['-10%', '20%', '-10%'],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ background: secondaryColor }}
        animate={{
          x: ['20%', '-10%', '20%'],
          y: ['10%', '-20%', '10%'],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Floating math symbols */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-xs font-orbitron font-bold select-none pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            color: i % 2 === 0 ? primaryColor : secondaryColor,
            opacity: 0.3,
            textShadow: `0 0 6px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
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
      
      {/* Radial glow from center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${primaryColor}15 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;