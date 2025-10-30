'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Search, Loader2 } from 'lucide-react';

export function MobileJobSearch() {
  const {
    jobSearch,
    updateJobSearch,
    analyzeCurrentJob,
    isLoading,
    error,
    clearError
  } = useAppStore();

  const [jobDescription, setJobDescription] = useState(jobSearch.currentQuery || '');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

    clearError();
    updateJobSearch(jobDescription);
    await analyzeCurrentJob();
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!jobDescription.trim() || isLoading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Analyze Match
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        Paste a job description to see your match score
      </div>
    </div>
  );
}