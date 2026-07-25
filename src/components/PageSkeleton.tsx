import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const shimmer = "animate-pulse bg-muted/40 rounded";

export const PageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
    <div className="absolute inset-0">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
          }}
          animate={{
            y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600)],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>

    <motion.div
      className="text-center z-10 space-y-6 w-full max-w-md px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative inline-block">
        <div className="text-6xl font-orbitron font-black text-primary/30">E</div>
        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-gem/40 animate-pulse" />
        <Zap className="absolute -bottom-3 -left-3 w-6 h-6 text-secondary/40 animate-pulse" />
      </div>

      <div className="space-y-3">
        <div className={`h-8 w-48 mx-auto ${shimmer}`} />
        <div className={`h-4 w-64 mx-auto ${shimmer}`} />
      </div>

      <div className="space-y-2 pt-2">
        <div className={`h-3 w-full ${shimmer}`} />
        <div className={`h-3 w-3/4 mx-auto ${shimmer}`} />
      </div>

      <div className="flex justify-center gap-2 pt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

export default PageSkeleton;
