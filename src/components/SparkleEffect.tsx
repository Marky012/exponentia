import { motion } from 'framer-motion';

interface SparkleEffectProps {
  isActive: boolean;
  color: 'blue' | 'pink';
}

const SparkleEffect = ({ isActive, color }: SparkleEffectProps) => {
  if (!isActive) return null;

  const sparkleColor = color === 'blue' 
    ? 'hsl(202, 60%, 75%)' 
    : 'hsl(330, 90%, 75%)';

  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 45) * (Math.PI / 180),
    delay: i * 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute left-1/2 top-1/2 w-2 h-2"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            x: [0, Math.cos(sparkle.angle) * 50, Math.cos(sparkle.angle) * 60],
            y: [0, Math.sin(sparkle.angle) * 50, Math.sin(sparkle.angle) * 60],
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0.5],
          }}
          transition={{ 
            duration: 1.5, 
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
          style={{
            marginLeft: '-4px',
            marginTop: '-4px',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <path
              d="M4 0 L4.5 3.5 L8 4 L4.5 4.5 L4 8 L3.5 4.5 L0 4 L3.5 3.5 Z"
              fill={sparkleColor}
              filter={`drop-shadow(0 0 4px ${sparkleColor})`}
            />
          </svg>
        </motion.div>
      ))}
      
      {/* Orbiting sparkles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: sparkleColor,
            boxShadow: `0 0 8px ${sparkleColor}`,
            marginLeft: '-3px',
            marginTop: '-3px',
          }}
          animate={{
            x: [
              Math.cos(i * (2 * Math.PI / 3)) * 55,
              Math.cos(i * (2 * Math.PI / 3) + Math.PI) * 55,
              Math.cos(i * (2 * Math.PI / 3) + 2 * Math.PI) * 55,
            ],
            y: [
              Math.sin(i * (2 * Math.PI / 3)) * 55,
              Math.sin(i * (2 * Math.PI / 3) + Math.PI) * 55,
              Math.sin(i * (2 * Math.PI / 3) + 2 * Math.PI) * 55,
            ],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default SparkleEffect;