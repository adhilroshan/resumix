'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Loader2, Upload, Brain, FileText, Target } from 'lucide-react';
import { animations, springs } from '@/lib/animations';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'orange' | 'purple';
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showPercentage = true,
  animated = true,
  label,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          className={`h-full ${colorStyles[color]} rounded-full`}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={animated ? {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 1
          } : {}}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'blue',
  showPercentage = true,
  animated = true,
  className = '',
  children
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    blue: { stroke: '#3B82F6', trail: '#DBEAFE' },
    green: { stroke: '#10B981', trail: '#D1FAE5' },
    orange: { stroke: '#F97316', trail: '#FED7AA' },
    purple: { stroke: '#8B5CF6', trail: '#EDE9FE' }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorStyles[color].trail}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorStyles[color].stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={animated ? {
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 1.5
          } : {}}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            {showPercentage && (
              <motion.span
                className="text-2xl font-bold text-gray-900"
                initial={animated ? { opacity: 0, scale: 0.5 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {Math.round(percentage)}%
              </motion.span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface StepProgressProps {
  steps: { id: string; label: string; icon?: React.ReactNode; status: 'pending' | 'active' | 'completed' }[];
  currentStep: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StepProgress({ steps, currentStep, size = 'md', className = '' }: StepProgressProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const lineColor = 'bg-gray-200';
  const activeLineColor = 'bg-blue-500';
  const completedLineColor = 'bg-green-500';

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <motion.div
              className={`
                ${sizeStyles[size]} rounded-full flex items-center justify-center
                border-2 relative z-10
                ${isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    key="active"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {step.icon || <Circle className="w-4 h-4" />}
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {step.icon || <Circle className="w-4 h-4" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step Label */}
            <div className="ml-3 flex-1">
              <motion.div
                className={`font-medium ${
                  isCompleted
                    ? 'text-green-600'
                    : isActive
                      ? 'text-blue-600'
                      : 'text-gray-500'
                }`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {step.label}
              </motion.div>
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <motion.div
                className={`
                  flex-1 h-1 mx-4 rounded-full
                  ${isCompleted ? completedLineColor : lineColor}
                `}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                style={{ originX: 0 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface MultiStageProgressProps {
  stages: { name: string; icon?: React.ReactNode; duration?: number }[];
  currentStage: number;
  isProcessing?: boolean;
  className?: string;
}

export function MultiStageProgress({ stages, currentStage, isProcessing = false, className = '' }: MultiStageProgressProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="space-y-4">
        {/* Current Stage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"
              animate={{
                rotate: isProcessing ? 360 : 0,
              }}
              transition={{
                duration: 2,
                repeat: isProcessing ? Infinity : 0,
                ease: 'linear'
              }}
            >
              {stages[currentStage]?.icon || <Brain className="w-6 h-6" />}
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900">{stages[currentStage]?.name}</h3>
              {isProcessing && (
                <p className="text-sm text-gray-500">Processing...</p>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {currentStage + 1} of {stages.length}
          </span>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          value={currentStage + 1}
          max={stages.length}
          size="sm"
          color="blue"
          animated={!isProcessing}
        />

        {/* Stage List */}
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;

            return (
              <motion.div
                key={stage.name}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg
                  ${isCompleted
                    ? 'bg-green-50 text-green-700'
                    : isActive
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-50 text-gray-600'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stage.name}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface FileUploadProgressProps {
  progress: number;
  fileName?: string;
  fileIcon?: React.ReactNode;
  className?: string;
}

export function FileUploadProgress({ progress, fileName, fileIcon, className = '' }: FileUploadProgressProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"
          animate={{
            rotate: progress < 100 ? 360 : 0,
          }}
          transition={{
            duration: 2,
            repeat: progress < 100 ? Infinity : 0,
            ease: 'linear'
          }}
        >
          {fileIcon || <Upload className="w-5 h-5" />}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName || 'Uploading file...'}
            </p>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            size="sm"
            color="blue"
            animated={progress < 100}
          />
        </div>
      </div>
    </motion.div>
  );
}