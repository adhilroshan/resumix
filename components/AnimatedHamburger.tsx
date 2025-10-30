'use client';

import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function AnimatedHamburger({ isOpen, onClick, className = '' }: AnimatedHamburgerProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-2 text-gray-600 hover:text-gray-900 ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="relative w-5 h-5"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}