// components/ui/animations.tsx
'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { ReactNode } from 'react';

interface SlideInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
}

export const SlideIn = ({ 
  children, 
  direction = 'bottom', 
  delay = 0, 
  duration = 0.3,
  ...props 
}: SlideInProps) => {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    top: { x: 0, y: -20 },
    bottom: { x: 0, y: 20 },
  };

  const initial = {
    opacity: 0,
    ...directionMap[direction],
  };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={initial}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};