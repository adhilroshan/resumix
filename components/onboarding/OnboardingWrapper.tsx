'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { OnboardingWelcome } from './OnboardingWelcome';
import { OnboardingComplete } from './OnboardingComplete';

interface OnboardingStep {
  id: number;
  component: React.ReactNode;
}

export function OnboardingWrapper() {
  const {
    onboardingStep,
    completeOnboarding
  } = useAppStore();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 0,
      component: <OnboardingWelcome />
    },
    {
      id: 1,
      component: <OnboardingComplete />
    }
  ];

  const currentStep = onboardingSteps.find(step => step.id === onboardingStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={onboardingStep}
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
        >
          {currentStep?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}