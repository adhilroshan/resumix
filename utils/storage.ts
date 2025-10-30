import { Resume, JobDescription, AnalysisResult } from '@/types';

const STORAGE_KEYS = {
  RESUMES: 'resumix_resumes',
  JOBS: 'resumix_jobs',
  ANALYSES: 'resumix_analyses',
  SETTINGS: 'resumix_settings',
} as const;

export class LocalStorage {
  // Resume management
  static saveResume(resume: Resume): void {
    const resumes = this.getResumes();
    const existingIndex = resumes.findIndex(r => r.id === resume.id);

    if (existingIndex >= 0) {
      resumes[existingIndex] = resume;
    } else {
      resumes.push(resume);
    }

    this.setItem(STORAGE_KEYS.RESUMES, resumes);
  }

  static getResumes(): Resume[] {
    return this.getItem(STORAGE_KEYS.RESUMES) || [];
  }

  static deleteResume(resumeId: string): void {
    const resumes = this.getResumes().filter(r => r.id !== resumeId);
    this.setItem(STORAGE_KEYS.RESUMES, resumes);

      }

  // Job management
  static saveJob(job: JobDescription): void {
    const jobs = this.getJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);

    if (existingIndex >= 0) {
      jobs[existingIndex] = job;
    } else {
      jobs.push(job);
    }

    this.setItem(STORAGE_KEYS.JOBS, jobs);
  }

  static getJobs(): JobDescription[] {
    return this.getItem(STORAGE_KEYS.JOBS) || [];
  }

  static deleteJob(jobId: string): void {
    const jobs = this.getJobs().filter(j => j.id !== jobId);
    this.setItem(STORAGE_KEYS.JOBS, jobs);

      }

  // Analysis management
  static saveAnalysis(analysis: AnalysisResult): void {
    const analyses = this.getAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);

    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }

    this.setItem(STORAGE_KEYS.ANALYSES, analyses);
  }

  static getAnalyses(): AnalysisResult[] {
    return this.getItem(STORAGE_KEYS.ANALYSES) || [];
  }

  
  static deleteAnalysis(analysisId: string): void {
    const analyses = this.getAnalyses().filter(a => a.id !== analysisId);
    this.setItem(STORAGE_KEYS.ANALYSES, analyses);
  }

  // Settings management
  static saveSettings(settings: any): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  static getSettings(): any {
    return this.getItem(STORAGE_KEYS.SETTINGS) || {};
  }

  // Utility methods
  static setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save data to local storage');
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to retrieve from localStorage:', error);
      return null;
    }
  }

  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static getStorageUsage(): { used: number; available: number } {
    try {
      let totalUsed = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalUsed += item.length;
        }
      });

      // Estimate available space (typically 5-10MB for localStorage)
      const estimated = 5 * 1024 * 1024; // 5MB
      return {
        used: totalUsed,
        available: Math.max(0, estimated - totalUsed),
      };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }

  static exportData(): string {
    const data = {
      resumes: this.getResumes(),
      jobs: this.getJobs(),
      analyses: this.getAnalyses(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.resumes) {
        this.setItem(STORAGE_KEYS.RESUMES, data.resumes);
      }
      if (data.jobs) {
        this.setItem(STORAGE_KEYS.JOBS, data.jobs);
      }
      if (data.analyses) {
        this.setItem(STORAGE_KEYS.ANALYSES, data.analyses);
      }
      if (data.settings) {
        this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }
    } catch (error) {
      throw new Error('Invalid data format. Please check the import file.');
    }
  }
}