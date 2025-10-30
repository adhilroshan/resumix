'use client';

import { motion } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { CheckCircle, Search } from 'lucide-react';
import { useEffect } from 'react';

export function OnboardingComplete() {
  const { completeOnboarding } = useAppStore();

  // Auto-advance to main app after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      completeOnboarding();
    }, 3000);

    return () => clearTimeout(timer);
  }, [completeOnboarding]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
    >
      {/* Success Icon */}
      <motion.div
        className="w-16 h-16 mx-auto mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      >
        <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: 0.5
            }}
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.h2
        className="text-2xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        You're ready!
      </motion.h2>

      <motion.p
        className="text-gray-600 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Find your perfect job
      </motion.p>

      {/* CTA Button */}
      <motion.button
        onClick={completeOnboarding}
        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all min-h-[52px] flex items-center justify-center gap-2 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
      >
        <Search className="w-5 h-5" />
        Explore Jobs
      </motion.button>

      {/* Loading dots */}
      <motion.div
        className="flex justify-center gap-1 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}