'use client';

import { useAppStore } from '@/lib/store';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';

export function MobileAnalysisCards() {
  const { currentAnalysis, setActiveMobileTab } = useAppStore();

  if (!currentAnalysis) {
    return null;
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Match Score</h2>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${scoreColor(currentAnalysis.overallMatch)}`}>
            <Target className="w-5 h-5 mr-2" />
            <span className="text-2xl font-bold">{currentAnalysis.overallMatch}%</span>
          </div>
        </div>

        {/* Job Info */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">{currentAnalysis.jobTitle}</h3>
          <p className="text-sm text-gray-600">{currentAnalysis.jobCompany}</p>
        </div>

        {/* Key Improvements */}
        {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Key Improvements
            </h3>
            <div className="space-y-2">
              {currentAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => setActiveMobileTab('search')}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        Search Another Job
      </button>
    </div>
  );
}