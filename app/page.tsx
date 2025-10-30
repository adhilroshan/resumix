'use client';

import { useEffect } from 'react';
import { JobSearch } from '@/components/JobSearch';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MobileTabNavigation } from '@/components/mobile/MobileTabNavigation';
import { MobileJobSearch } from '@/components/mobile/MobileJobSearch';
import { MobileAnalysisCards } from '@/components/mobile/MobileAnalysisCards';
import { OnboardingWrapper } from '@/components/onboarding/OnboardingWrapper';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const {
    isLoggedIn,
    currentAnalysis,
    activeMobileTab,
    loadStoredData,
    clearError,
    setActiveMobileTab,
    isOnboarding,
    error,
  } = useAppStore();

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  // Render content based on current mobile tab
  const renderMobileContent = () => {
    switch (activeMobileTab) {
      case 'home':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Welcome</h2>
            <p className="text-gray-600 mb-6">
              Ready to find your perfect job match
            </p>
            <button
              onClick={() => setActiveMobileTab('search')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Find Jobs
            </button>
          </div>
        );

      case 'search':
        return <MobileJobSearch />;

      case 'analysis':
        return currentAnalysis ? <MobileAnalysisCards /> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analysis Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Search for a job to see your match score
            </p>
            <button
              onClick={() => setActiveMobileTab('search')}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Searching
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      {/* Show onboarding flow instead of main app */}
      {isOnboarding ? (
        <OnboardingWrapper />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Simple Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 py-3">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-900">Resumix</h1>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pb-20">
            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 py-4">
              {/* Mobile Layout */}
              <div className="md:hidden">
                {renderMobileContent()}
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block max-w-4xl mx-auto">
                {isLoggedIn && (
                  <div className="space-y-6">
                    <JobSearch />

                    {/* Analysis Results */}
                    {currentAnalysis && (
                      <AnalysisResults analysis={currentAnalysis} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Mobile Tab Navigation */}
          <MobileTabNavigation />

          {/* PWA Install Prompt */}
          <PWAInstaller />
        </div>
      )}
    </ErrorBoundary>
  );
}