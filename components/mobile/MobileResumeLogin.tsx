'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/lib/store';
import { animations, springs } from '@/lib/animations';
import {
  Upload,
  Camera,
  FileText,
  Cloud,
  Clipboard,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  NoResumeEmptyState
} from '../ui/EmptyStates';
import {
  UploadSuccessState
} from '../ui/SuccessStates';
import {
  FileUploadProgress,
  ProgressBar
} from '../ui/ProgressIndicators';

interface UploadOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function MobileResumeLogin() {
  const {
    uploadAndAuthenticateResume,
    isLoading,
    loginError,
    clearError,
    resume,
    resumeValidation,
    uploadProgress
  } = useAppStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    clearError();
    setUploadSuccess(false);
    try {
      await uploadAndAuthenticateResume(file);
      setUploadSuccess(true);
      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadSuccess(false);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        // Create a file from clipboard text
        const blob = new Blob([text], { type: 'text/plain' });
        const file = new File([blob], 'resume-from-clipboard.txt', { type: 'text/plain' });
        await handleFileUpload(file);
      }
    } catch (error) {
      console.error('Clipboard read failed:', error);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const uploadOptions: UploadOption[] = [
    {
      id: 'camera',
      title: 'Take Photo',
      description: 'Scan your resume with camera',
      icon: <Camera className="h-6 w-6" />,
      action: handleCameraCapture,
    },
    {
      id: 'file',
      title: 'Choose File',
      description: 'PDF, DOCX, TXT, or MD',
      icon: <Upload className="h-6 w-6" />,
      action: handleFileSelect,
    },
    {
      id: 'cloud',
      title: 'Cloud Storage',
      description: 'Google Drive, Dropbox',
      icon: <Cloud className="h-6 w-6" />,
      action: handleFileSelect, // TODO: Implement cloud storage integration
    },
    {
      id: 'clipboard',
      title: 'Paste from Clipboard',
      description: 'Paste resume text directly',
      icon: <Clipboard className="h-6 w-6" />,
      action: handleClipboardPaste,
    },
  ];

  // If user is logged in, show profile view
  if (resume && resumeValidation?.isValid) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Resume Profile</h3>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <Check className="h-4 w-4 mr-1" />
              Complete and verified
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-900">{resume.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Skills</span>
            <span className="text-sm font-medium text-gray-900">
              {resume.parsedData?.skills?.length || 0} identified
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Experience</span>
            <span className="text-sm font-medium text-gray-900">
              {resume.parsedData?.experience?.length || 0} positions
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Education</span>
            <span className="text-sm font-medium text-gray-900">
              {resume.parsedData?.education?.length || 0} entries
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show upload method selection
  if (uploadMethod === null) {
    return (
      <div className="mb-4">
        <AnimatePresence mode="wait">
          {uploadSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <UploadSuccessState onViewAnalysis={() => {
                setUploadSuccess(false);
                // Navigate to search tab or analysis view
              }} />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <NoResumeEmptyState />

              {/* Enhanced Upload Options */}
              <motion.div
                className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Choose Upload Method
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {uploadOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      onClick={option.action}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors min-h-[100px] relative overflow-hidden group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        type: 'spring',
                        stiffness: 400,
                        damping: 25
                      }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(59, 130, 246, 0.05)'
                      }}
                    >
                      {/* Shimmer effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />

                      <motion.div
                        className="text-blue-600 mb-2 relative z-10"
                        whileHover={{ y: -2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {option.icon}
                      </motion.div>
                      <span className="text-sm font-medium text-gray-900 relative z-10">
                        {option.title}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 text-center relative z-10">
                        {option.description}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Show drag and drop area
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {uploadMethod === 'camera' ? 'Capture Resume' : 'Upload Resume'}
        </h3>
        <motion.button
          onClick={() => setUploadMethod(null)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.1 }}
        >
          <X className="h-5 w-5" />
        </motion.button>
      </motion.div>

      {/* Enhanced Drag and Drop Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors relative overflow-hidden
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          scale: dragActive ? 1.02 : 1,
          borderColor: dragActive ? '#60A5FA' : '#D1D5DB'
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Progress indicator when loading */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {uploadProgress !== undefined ? (
                <div className="w-full max-w-xs">
                  <FileUploadProgress
                    progress={uploadProgress}
                    fileName="Resume"
                    fileIcon={<FileText className="w-5 h-5" />}
                  />
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-8 w-8 text-blue-600 mb-3" />
                  </motion.div>
                  <p className="text-gray-600">Processing your resume...</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}
                animate={{
                  scale: dragActive ? 1.1 : 1,
                  backgroundColor: dragActive ? '#DBEAFE' : '#F3F4F6'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
              </motion.div>

              <p className="text-gray-600 mb-2 font-medium">
                {uploadMethod === 'camera'
                  ? 'Position your resume in the camera frame'
                  : dragActive
                    ? 'Drop your resume here'
                    : 'Drag and drop your resume here'
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>

              <motion.button
                onClick={uploadOptions.find(o => o.id === uploadMethod)?.action}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors min-h-[44px] relative overflow-hidden group"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <span className="relative z-10 font-medium">
                  {uploadMethod === 'camera' ? 'Take Photo' : 'Browse Files'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating particles for visual interest */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-30"
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 15}%`,
              }}
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {loginError && (
          <motion.div
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-red-600 mr-2 mt-0.5 flex-shrink-0"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              <AlertCircle className="h-5 w-5" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm text-red-700">{loginError}</p>
            </div>
            <motion.button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 ml-2 p-1 rounded hover:bg-red-100"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </motion.div>
  );
}