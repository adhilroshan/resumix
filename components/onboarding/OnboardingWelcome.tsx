'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { Upload, Camera, FileText } from 'lucide-react';

export function OnboardingWelcome() {
  const {
    uploadAndAuthenticateResume,
    isLoading,
    loginError,
    clearError,
    nextOnboardingStep
  } = useAppStore();

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    clearError();
    try {
      const success = await uploadAndAuthenticateResume(file);
      if (success) {
        // Auto-advance to success screen
        setTimeout(() => {
          nextOnboardingStep();
        }, 1500);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment';
    cameraInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    cameraInput.click();
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
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
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        className="text-2xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Resumix
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-gray-600 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Upload resume to get started
      </motion.p>

      {/* Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-2xl p-8 mb-4 relative overflow-hidden
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 mt-3 text-sm">Processing...</p>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Upload className={`w-8 h-8 mb-3 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
            <p className="text-gray-600 text-sm font-medium mb-1">
              {dragActive ? 'Drop here' : 'Drag resume here'}
            </p>
            <p className="text-gray-500 text-xs mb-4">or</p>
            <motion.button
              onClick={handleFileSelect}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              Browse Files
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Camera Button */}
      <motion.button
        onClick={handleCameraCapture}
        className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </motion.button>

      {/* Error */}
      {loginError && (
        <motion.div
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loginError}
        </motion.div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </motion.div>
  );
}