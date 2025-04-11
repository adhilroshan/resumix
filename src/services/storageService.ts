// Type definitions for storage objects
export interface UserInformation {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  yearsOfExperience: string;
  educationLevel: string;
  bio: string;
}

export interface ResumeData {
  resumeText: string;
  fileName: string;
  uploadDate: string;
  sourceType?: 'pdf' | 'text' | 'latex';
}

export interface AnalysisResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  recommendations: string[];
  missingSkills: string[];
  timestamp: string;
  jobDescription: string;
}

// Storage keys
const STORAGE_KEYS = {
  USER_INFO: 'userInformation',
  RESUME: 'resumeText',
  RESUME_FILE_NAME: 'resumeFileName',
  SKILLS: 'userSkills',
  API_KEY: 'openRouterApiKey',
  LAST_ANALYSIS: 'lastAnalysisResult',
  LAST_ANALYSIS_TIMESTAMP: 'lastAnalysisTimestamp',
  CURRENT_JOB_DESCRIPTION: 'currentJobDescription',
  ANALYSIS_HISTORY: 'analysisHistory',
};

// StorageService class
export class StorageService {
  // Get user information
  static getUserInformation(): UserInformation | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user information from storage:', error);
      return null;
    }
  }

  // Save user information
  static saveUserInformation(userInfo: UserInformation): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error saving user information to storage:', error);
    }
  }

  // Get resume data
  static getResumeData(): ResumeData | null {
    try {
      const resumeText = localStorage.getItem(STORAGE_KEYS.RESUME);
      const fileName = localStorage.getItem(STORAGE_KEYS.RESUME_FILE_NAME);
      
      if (!resumeText || !fileName) {
        return null;
      }
      
      return {
        resumeText,
        fileName,
        uploadDate: localStorage.getItem('resumeUploadDate') || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting resume data from storage:', error);
      return null;
    }
  }

  // Save resume data
  static saveResumeData(data: ResumeData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESUME, data.resumeText);
      localStorage.setItem(STORAGE_KEYS.RESUME_FILE_NAME, data.fileName);
      localStorage.setItem('resumeUploadDate', data.uploadDate || new Date().toISOString());
      if (data.sourceType) {
        localStorage.setItem('resumeSourceType', data.sourceType);
      }
    } catch (error) {
      console.error('Error saving resume data to storage:', error);
    }
  }

  // For backward compatibility
  static saveResumeText(text: string, fileName: string): void {
    this.saveResumeData({
      resumeText: text,
      fileName,
      uploadDate: new Date().toISOString(),
      sourceType: 'pdf'
    });
  }

  // Get user skills
  static getUserSkills(): string[] {
    try {
      const skills = localStorage.getItem(STORAGE_KEYS.SKILLS);
      return skills ? JSON.parse(skills) : [];
    } catch (error) {
      console.error('Error getting user skills from storage:', error);
      return [];
    }
  }

  // Save user skills
  static saveUserSkills(skills: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    } catch (error) {
      console.error('Error saving user skills to storage:', error);
    }
  }

  // Get API key
  static getOpenRouterApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }

  // Save API key
  static saveOpenRouterApiKey(apiKey: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }

  // Get last analysis result
  static getLastAnalysisResult(): AnalysisResult | null {
    try {
      const result = localStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS);
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS_TIMESTAMP);
      const jobDescription = localStorage.getItem(STORAGE_KEYS.CURRENT_JOB_DESCRIPTION);
      
      if (!result || !timestamp || !jobDescription) {
        return null;
      }
      
      return {
        ...JSON.parse(result),
        timestamp,
        jobDescription,
      };
    } catch (error) {
      console.error('Error getting last analysis result from storage:', error);
      return null;
    }
  }

  // Save analysis result
  static saveAnalysisResult(result: Omit<AnalysisResult, 'timestamp'>, jobDescription: string): void {
    try {
      const timestamp = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS, JSON.stringify(result));
      localStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS_TIMESTAMP, timestamp);
      localStorage.setItem(STORAGE_KEYS.CURRENT_JOB_DESCRIPTION, jobDescription);
      
      // Add to history
      const analysisWithMeta = {
        ...result,
        timestamp,
        jobDescription,
      };
      
      this.addToAnalysisHistory(analysisWithMeta);
    } catch (error) {
      console.error('Error saving analysis result to storage:', error);
    }
  }

  // Add analysis to history
  private static addToAnalysisHistory(analysis: AnalysisResult): void {
    try {
      const history = this.getAnalysisHistory();
      history.unshift(analysis);
      
      // Keep only last 10 analyses
      const trimmedHistory = history.slice(0, 10);
      
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding to analysis history:', error);
    }
  }

  // Get analysis history
  static getAnalysisHistory(): AnalysisResult[] {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting analysis history from storage:', error);
      return [];
    }
  }

  // Check if user has completed the initial setup
  static hasCompletedSetup(): boolean {
    return !!(
      this.getUserInformation() &&
      this.getResumeData() &&
      this.getUserSkills().length > 0
    );
  }

  // Clear all data
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing data from storage:', error);
    }
  }
} 