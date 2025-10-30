'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, User, LogOut, Edit } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ResumeValidation } from '@/types';
import { clsx } from '@/lib/utils';

interface ResumeAuthenticationProps {
  className?: string;
}

export function ResumeAuthentication({ className }: ResumeAuthenticationProps) {
  const {
    resume,
    isLoggedIn,
    resumeValidation,
    loginError,
    isLoading,
    uploadAndAuthenticateResume,
    logout,
    updateResumeData,
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    education: '',
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await uploadAndAuthenticateResume(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleEditResume = () => {
    if (resume) {
      setEditForm({
        name: resume.parsedData?.contactInfo?.name || '',
        email: resume.parsedData?.contactInfo?.email || '',
        phone: resume.parsedData?.contactInfo?.phone || '',
        skills: resume.parsedData?.skills?.join(', ') || '',
        experience: resume.parsedData?.experience?.map(exp =>
          `${exp.title} at ${exp.company} (${exp.duration})`
        ).join('\n') || '',
        education: resume.parsedData?.education?.map(edu =>
          `${edu.degree} from ${edu.institution} (${edu.year})`
        ).join('\n') || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (!resume) return;

    const updatedParsedData = {
      ...resume.parsedData,
      contactInfo: {
        ...resume.parsedData?.contactInfo,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      },
      skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience: editForm.experience.split('\n').map(line => ({
        title: 'Software Engineer',
        company: 'Company Name',
        duration: 'Duration',
        description: [line],
        skills: [],
      })),
      education: editForm.education.split('\n').map(line => ({
        degree: line.split(' from ')[0],
        institution: line.split(' from ')[1]?.split(' (')[0] || '',
        year: line.match(/\(([^)]+)\)/)?.[1] || '',
      })),
    };

    updateResumeData({
      ...resume,
      parsedData: updatedParsedData,
    });

    setIsEditing(false);
  };

  if (isLoggedIn && resume) {
    return (
      <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {resume.parsedData?.contactInfo?.name || resume.name}
              </h3>
              <p className="text-sm text-gray-500">Resume uploaded and validated</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditResume}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Edit resume"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-red-500 hover:text-red-700"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Edit Resume Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <textarea
                placeholder="Skills (comma-separated)"
                value={editForm.skills}
                onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Work Experience (one entry per line)"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Education (one entry per line)"
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {resume.parsedData?.contactInfo?.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {resume.parsedData.contactInfo.email}
              </p>
            )}
            {resume.parsedData?.contactInfo?.phone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {resume.parsedData.contactInfo.phone}
              </p>
            )}
            {resume.parsedData?.skills && resume.parsedData.skills.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resume.parsedData.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {resume.parsedData.skills.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{resume.parsedData.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600 mb-6">
          Upload your resume to get started with AI-powered job analysis
        </p>

        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-blue-400 hover:bg-blue-50',
            isDragActive && 'border-blue-400 bg-blue-50',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-blue-500 animate-bounce" />
            ) : (
              <FileText className="h-12 w-12 text-gray-400" />
            )}

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select a file
              </p>
              <p className="text-xs text-gray-400">
                Supports PDF, DOCX, TXT, and MD files (max 10MB)
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              className={clsx(
                'px-6 py-3 rounded-md text-sm font-medium transition-colors',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Processing...' : 'Select Resume File'}
            </button>
          </div>
        </div>

        {loginError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-left">
                <p className="text-sm text-red-700 font-medium">Validation Error</p>
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            </div>
          </div>
        )}

        {resumeValidation && !resumeValidation.isValid && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-left flex-1">
                <p className="text-sm text-yellow-700 font-medium mb-2">
                  Resume is {resumeValidation.completenessScore}% Complete
                </p>
                <p className="text-sm text-yellow-600 mb-3">Missing information:</p>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {resumeValidation.missingFields.map((field, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                      {field}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-yellow-600 mt-3">
                  Please edit your resume to add the missing information, or upload a more complete resume.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p className="flex items-center justify-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Your resume is processed locally and never uploaded to external servers
          </p>
        </div>
      </div>
    </div>
  );
}