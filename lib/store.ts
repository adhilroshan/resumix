import { create } from 'zustand';
import {
  Resume,
  JobDescription,
  AnalysisResult,
  AppState,
  ResumeValidation,
  JobValidation,
  JobSearch
} from '@/types';
import { LocalStorage } from '@/utils/storage';
import { getAIService } from './aiService';
import { processFile } from '@/utils/fileProcessor';

interface AppStore extends AppState {
  // Resume authentication actions
  uploadAndAuthenticateResume: (file: File) => Promise<boolean>;
  validateResume: (resume: Resume) => Promise<ResumeValidation>;
  updateResumeData: (updates: Partial<Resume>) => void;
  logout: () => void;

  // Job search actions
  updateJobSearch: (query: string) => void;
  validateJobDescription: (content: string) => Promise<JobValidation>;
  addToSearchHistory: (jobDescription: Omit<JobDescription, 'id' | 'createdAt'>) => void;
  removeFromSearchHistory: (jobId: string) => void;
  clearSearchHistory: () => void;

  // Analysis actions
  analyzeCurrentJob: () => Promise<AnalysisResult>;
  deleteAnalysis: (analysisId: string) => void;

  // Data management
  loadStoredData: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Mobile navigation
  activeMobileTab: string;
  setActiveMobileTab: (tab: string) => void;

  // Onboarding state
  isOnboarding: boolean;
  onboardingStep: number;
  hasCompletedOnboarding: boolean;
  setOnboardingStep: (step: number) => void;
  nextOnboardingStep: () => void;
  previousOnboardingStep: () => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  resume: null,
  isLoggedIn: false,
  resumeValidation: null,
  loginError: null,
  jobSearch: {
    currentQuery: '',
    validationErrors: [],
    isValid: false,
    lastValidated: null,
  },
  searchHistory: [],
  currentAnalysis: null,
  analysisHistory: [],
  isLoading: false,
  error: null,
  activeMobileTab: 'home',

  // Onboarding state
  isOnboarding: true, // Start in onboarding mode
  onboardingStep: 0,
  hasCompletedOnboarding: false,

  // Resume authentication actions
  uploadAndAuthenticateResume: async (file: File) => {
    set({ isLoading: true, loginError: null });
    try {
      const resume = await processFile(file);
      const validation = await get().validateResume(resume);

      if (!validation.isValid) {
        set({
          resume,
          resumeValidation: validation,
          loginError: 'Resume is incomplete. Please provide the missing information.',
          isLoading: false,
        });
        return false;
      }

      // Successful authentication
      set({
        resume,
        resumeValidation: validation,
        isLoggedIn: true,
        loginError: null,
        isLoading: false,
      });

      LocalStorage.saveResume(resume);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload resume';
      set({ loginError: errorMessage, isLoading: false });
      return false;
    }
  },

  validateResume: async (resume: Resume): Promise<ResumeValidation> => {
    try {
      const response = await fetch('/api/validate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeContent: resume.content }),
      });

      if (!response.ok) {
        throw new Error('Resume validation failed');
      }

      return await response.json();
    } catch (error) {
      // Fallback to basic validation if API fails
      const validation: ResumeValidation = {
        isValid: false,
        completenessScore: 0,
        requiredFields: {
          contactInfo: false,
          skills: false,
          experience: false,
          education: false,
        },
        missingFields: [],
        suggestions: [],
        validationErrors: ['Validation service unavailable'],
      };

      // Basic client-side validation as fallback
      if (resume.parsedData?.contactInfo?.email || resume.parsedData?.contactInfo?.phone) {
        validation.requiredFields.contactInfo = true;
      }
      if (resume.parsedData?.skills && resume.parsedData.skills.length > 0) {
        validation.requiredFields.skills = true;
      }
      if (resume.parsedData?.experience && resume.parsedData.experience.length > 0) {
        validation.requiredFields.experience = true;
      }
      if (resume.parsedData?.education && resume.parsedData.education.length > 0) {
        validation.requiredFields.education = true;
      }

      const fieldCount = Object.values(validation.requiredFields).filter(Boolean).length;
      validation.completenessScore = (fieldCount / 4) * 100;
      validation.isValid = validation.completenessScore === 100;

      return validation;
    }
  },

  updateResumeData: (updates: Partial<Resume>) => {
    const state = get();
    if (!state.resume) return;

    const updatedResume = { ...state.resume, ...updates };
    set({ resume: updatedResume });
    LocalStorage.saveResume(updatedResume);
  },

  logout: () => {
    set({
      resume: null,
      isLoggedIn: false,
      resumeValidation: null,
      loginError: null,
      currentAnalysis: null,
    });
  },

  // Job search actions
  updateJobSearch: (query: string) => {
    set({
      jobSearch: {
        currentQuery: query,
        validationErrors: [],
        isValid: false,
        lastValidated: new Date(),
      },
      error: null,
    });
  },

  validateJobDescription: async (content: string): Promise<JobValidation> => {
    try {
      const response = await fetch('/api/validate-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobContent: content }),
      });

      if (!response.ok) {
        throw new Error('Job validation failed');
      }

      return await response.json();
    } catch (error) {
      // Fallback to basic validation if API fails
      const validation: JobValidation = {
        isValid: false,
        qualityScore: 0,
        hasRequirements: false,
        hasBasicInfo: false,
        missingFields: [],
        suggestions: [],
        validationErrors: ['Validation service unavailable'],
      };

      const lowerContent = content.toLowerCase();

      // Basic client-side validation as fallback
      const hasTitle = lowerContent.length > 50;
      if (hasTitle) {
        validation.hasBasicInfo = true;
      } else {
        validation.missingFields.push('Job Title and Company Information');
      }

      const requirementKeywords = [
        'requirements', 'qualifications', 'skills', 'experience',
        'must have', 'required', 'responsibilities', 'duties'
      ];
      const hasRequirements = requirementKeywords.some(keyword => lowerContent.includes(keyword));
      if (hasRequirements) {
        validation.hasRequirements = true;
      } else {
        validation.missingFields.push('Job Requirements or Qualifications');
        validation.suggestions.push('Ensure the job description includes required skills and qualifications');
      }

      let score = 0;
      if (validation.hasBasicInfo) score += 50;
      if (validation.hasRequirements) score += 50;
      validation.qualityScore = score;
      validation.isValid = score >= 80;

      if (!validation.isValid) {
        validation.suggestions.push('Consider adding more specific details about the role and requirements');
      }

      return validation;
    }
  },

  addToSearchHistory: (jobDescription: Omit<JobDescription, 'id' | 'createdAt'>) => {
    const state = get();
    const job: JobDescription = {
      ...jobDescription,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    const updatedHistory = [job, ...state.searchHistory.slice(0, 9)]; // Keep last 10
    set({ searchHistory: updatedHistory });
    LocalStorage.setItem('resumix_search_history', updatedHistory);
  },

  removeFromSearchHistory: (jobId: string) => {
    const state = get();
    const updatedHistory = state.searchHistory.filter(j => j.id !== jobId);
    set({ searchHistory: updatedHistory });
    LocalStorage.setItem('resumix_search_history', updatedHistory);
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    LocalStorage.setItem('resumix_search_history', []);
  },

  // Analysis actions
  analyzeCurrentJob: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      if (!state.resume) throw new Error('No resume uploaded');
      if (!state.jobSearch.currentQuery) throw new Error('No job description provided');

      const aiService = getAIService();
      const jobDescription: JobDescription = {
        id: 'current',
        title: 'Current Job Analysis',
        company: 'Unknown',
        content: state.jobSearch.currentQuery,
        createdAt: new Date(),
      };

      const analysis = await aiService.analyzeResumeJobMatch(state.resume, jobDescription);

      // Update analysis with job info
      const updatedAnalysis: AnalysisResult = {
        ...analysis,
        jobTitle: jobDescription.title,
        jobCompany: jobDescription.company,
        jobContent: jobDescription.content,
      };

      const updatedHistory = [updatedAnalysis, ...state.analysisHistory];
      set({
        currentAnalysis: updatedAnalysis,
        analysisHistory: updatedHistory,
        isLoading: false,
      });

      LocalStorage.setItem('resumix_analysis_history', updatedHistory);
      return updatedAnalysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteAnalysis: (analysisId: string) => {
    const state = get();
    const updatedHistory = state.analysisHistory.filter(a => a.id !== analysisId);

    set({
      analysisHistory: updatedHistory,
      currentAnalysis: state.currentAnalysis?.id === analysisId ? null : state.currentAnalysis,
    });

    LocalStorage.setItem('resumix_analysis_history', updatedHistory);
  },

  // Data management
  loadStoredData: () => {
    const resume = LocalStorage.getResumes()[0] || null; // Get first resume
    const searchHistory: JobDescription[] = LocalStorage.getItem('resumix_search_history') || [];
    const analysisHistory: AnalysisResult[] = LocalStorage.getItem('resumix_analysis_history') || [];
    const hasCompletedOnboarding = LocalStorage.getItem('resumix_onboarding_complete') || false;

    set({
      resume,
      isLoggedIn: !!resume,
      searchHistory,
      analysisHistory,
      hasCompletedOnboarding,
      isOnboarding: !hasCompletedOnboarding, // Only show onboarding if not completed
    });
  },

  clearAllData: () => {
    set({
      resume: null,
      isLoggedIn: false,
      resumeValidation: null,
      loginError: null,
      jobSearch: {
        currentQuery: '',
        validationErrors: [],
        isValid: false,
        lastValidated: null,
      },
      searchHistory: [],
      currentAnalysis: null,
      analysisHistory: [],
    });
    LocalStorage.clearAll();
  },

  exportData: () => {
    const data = {
      resume: get().resume,
      searchHistory: get().searchHistory,
      analysisHistory: get().analysisHistory,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);

      if (data.resume) {
        LocalStorage.setItem('resumix_resumes', [data.resume]);
      }
      if (data.searchHistory) {
        LocalStorage.setItem('resumix_search_history', data.searchHistory);
      }
      if (data.analysisHistory) {
        LocalStorage.setItem('resumix_analysis_history', data.analysisHistory);
      }

      get().loadStoredData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      set({ error: errorMessage });
      throw error;
    }
  },

  // UI state
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  // Mobile navigation
  setActiveMobileTab: (tab: string) => set({ activeMobileTab: tab }),

  // Onboarding actions
  setOnboardingStep: (step: number) => set({ onboardingStep: step }),

  nextOnboardingStep: () => {
    const state = get();
    if (state.onboardingStep < 1) { // Only 2 steps (0-1)
      set({ onboardingStep: state.onboardingStep + 1 });
    }
  },

  previousOnboardingStep: () => {
    const state = get();
    if (state.onboardingStep > 0) {
      set({ onboardingStep: state.onboardingStep - 1 });
    }
  },

  completeOnboarding: () => {
    set({
      isOnboarding: false,
      hasCompletedOnboarding: true,
      onboardingStep: 2, // Completion step
    });
    // Save onboarding completion to local storage
    LocalStorage.setItem('resumix_onboarding_complete', true);
  },

  startOnboarding: () => {
    set({
      isOnboarding: true,
      onboardingStep: 0,
      hasCompletedOnboarding: false,
    });
  },
}));