import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'battle' | 'portal';
}

const variants = {
  default: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  battle: {
    initial: { opacity: 0, scale: 0.96, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, filter: 'blur(4px)' },
  },
  portal: {
    initial: { opacity: 0, scale: 0.85, rotate: -2 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 1.1, rotate: 2 },
  },
};

export const PageTransition = ({ children, className, variant = 'default' }: PageTransitionProps) => {
  const v = variants[variant];

  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
