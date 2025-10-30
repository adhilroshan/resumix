'use client';

import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Clock, Trash2, CheckCircle, AlertCircle, History } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { JobDescription, JobValidation } from '@/types';
import { clsx } from '@/lib/utils';

interface JobSearchProps {
  className?: string;
}

export function JobSearch({ className }: JobSearchProps) {
  const {
    jobSearch,
    searchHistory,
    currentAnalysis,
    isLoading,
    error,
    updateJobSearch,
    validateJobDescription,
    addToSearchHistory,
    removeFromSearchHistory,
    analyzeCurrentJob,
  } = useAppStore();

  const [jobValidation, setJobValidation] = useState<JobValidation | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (jobSearch.currentQuery && jobSearch.currentQuery.length > 100) {
      validateJobDescription(jobSearch.currentQuery).then(setJobValidation);
    } else {
      setJobValidation(null);
    }
  }, [jobSearch.currentQuery, validateJobDescription]);

  const handleAnalyze = async () => {
    if (!jobValidation?.isValid) {
      return;
    }

    try {
      await analyzeCurrentJob();
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleUseHistoryItem = (job: JobDescription) => {
    updateJobSearch(job.content);
    setShowHistory(false);
  };

  const handleSaveToHistory = () => {
    if (jobSearch.currentQuery && jobValidation?.isValid) {
      // Extract job title and company from content (basic implementation)
      const lines = jobSearch.currentQuery.split('\n');
      const titleLine = lines.find(line =>
        line.toLowerCase().includes('job title') ||
        line.toLowerCase().includes('position') ||
        line.length > 10 && line.length < 100
      ) || lines[0];

      addToSearchHistory({
        title: titleLine.substring(0, 50),
        company: 'Company Name', // Would need better extraction
        content: jobSearch.currentQuery,
      });
    }
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Search Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Search className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Job Description Search
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Job Description
            </label>
            <textarea
              value={jobSearch.currentQuery}
              onChange={(e) => updateJobSearch(e.target.value)}
              placeholder="Paste the complete job description from LinkedIn, Indeed, or any job board..."
              rows={8}
              className={clsx(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                jobValidation && !jobValidation.isValid
                  ? 'border-red-300 focus:ring-red-500'
                  : jobValidation?.isValid
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-gray-300'
              )}
            />
          </div>

          {/* Validation Status */}
          {jobValidation && (
            <div className={clsx(
              'p-3 rounded-md border',
              jobValidation.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            )}>
              <div className="flex items-start">
                {jobValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={clsx(
                    'text-sm font-medium mb-1',
                    jobValidation.isValid ? 'text-green-700' : 'text-yellow-700'
                  )}>
                    {jobValidation.isValid ? 'Valid Job Description' : 'Job Description Needs Improvement'}
                  </p>
                  {!jobValidation.isValid && jobValidation.missingFields.length > 0 && (
                    <div>
                      <p className="text-sm text-yellow-600 mb-2">Missing or unclear information:</p>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        {jobValidation.missingFields.map((field, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jobValidation.suggestions.length > 0 && (
                    <p className="text-sm text-yellow-600 mt-2">
                      <strong>Suggestion:</strong> {jobValidation.suggestions[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={!jobValidation?.isValid || isLoading}
                className={clsx(
                  'px-6 py-2 rounded-md text-sm font-medium transition-colors',
                  'bg-blue-600 text-white hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? 'Analyzing...' : 'Analyze Compatibility'}
                </div>
              </button>

              {jobSearch.currentQuery && jobValidation?.isValid && (
                <button
                  onClick={handleSaveToHistory}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Save to History
                </button>
              )}
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <History className="h-4 w-4 mr-1" />
              {showHistory ? 'Hide' : 'Show'} History ({searchHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
            </div>
            <button
              onClick={() => removeFromSearchHistory('all')}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {searchHistory.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 cursor-pointer" onClick={() => handleUseHistoryItem(job)}>
                  <div className="flex items-center mb-1">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{job.company}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => removeFromSearchHistory(job.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove from history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Analysis Status */}
      {currentAnalysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Analysis Complete</p>
                <p className="text-sm text-blue-700">
                  Overall compatibility: {currentAnalysis.overallMatch}%
                </p>
              </div>
            </div>
            <div className="text-sm text-blue-600">
              Analyzed on {new Date(currentAnalysis.analyzedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}