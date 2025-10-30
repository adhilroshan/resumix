'use client';

import { motion, AnimatePresence, Variants } from 'motion/react';

// Animation variants for consistent timing and easing
export const animations = {
  // Menu animations
  menu: {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 300 },
  },

  // Hamburger icon morphing
  hamburgerIcon: {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    open: {
      rotate: 45,
      translateY: 6,
    },
  },

  // Mobile tab navigation
  tabIndicator: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  // Card animations
  card: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  },

  // Swipeable card stack
  cardStack: {
    initial: { scale: 1, y: 0 },
    animate: { scale: 1, y: 0 },
    exit: {
      scale: 0.8,
      y: -50,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    swipe: {
      x: 300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  },

  // Onboarding flow transitions
  onboardingStep: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },

  // Progress bar animation
  progress: {
    initial: { width: '0%' },
    animate: { width: 'var(--progress-width)' },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },

  // Button press feedback
  button: {
    rest: { scale: 1 },
    press: { scale: 0.95 },
    hover: { scale: 1.05 },
  },

  // Form validation feedback
  shake: {
    initial: { x: 0 },
    animate: { x: [-10, 10, -10, 10, -5, 5, 0] },
    transition: { duration: 0.5 },
  },

  // Success checkmark animation
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
  },

  // Badge pulse for notifications
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 }
    },
  },

  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide up animation
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Stagger children animation
  staggerContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

// Spring configurations for natural physics
export const springs = {
  gentle: { type: 'spring', stiffness: 300, damping: 30 },
  snappy: { type: 'spring', stiffness: 400, damping: 25 },
  bouncy: { type: 'spring', stiffness: 500, damping: 20 },
};

// Easing functions for consistent timing
export const easings = {
  easeInOut: 'easeInOut',
  easeOut: 'easeOut',
  easeIn: 'easeIn',
};

// Common durations
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  extraSlow: 0.8,
};

// Custom hooks for common animations
export const useMenuAnimation = (isOpen: boolean) => {
  return {
    variants: animations.menu,
    initial: 'initial',
    animate: isOpen ? 'animate' : 'initial',
    exit: 'exit',
    transition: springs.gentle,
  };
};

export const useButtonAnimation = () => {
  return {
    whileTap: 'press',
    whileHover: 'hover',
    variants: animations.button,
    transition: springs.snappy,
  };
};

export const useCardAnimation = (index: number) => {
  return {
    variants: animations.card,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    transition: {
      ...springs.gentle,
      delay: index * 0.1,
    },
  };
};

// Accessibility helper for reduced motion
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation configuration with reduced motion support
export const getAnimationConfig = (normalConfig: any, reducedConfig: any = {}) => {
  if (shouldReduceMotion()) {
    return {
      ...normalConfig,
      transition: { duration: 0 },
      ...reducedConfig,
    };
  }
  return normalConfig;
};

// Re-export Motion components
export { motion, AnimatePresence };
export type { Variants };