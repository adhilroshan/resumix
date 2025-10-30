export interface Resume {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
  file: {
    name: string;
    size: number;
    type: string;
  };
  parsedData?: {
    contactInfo?: ContactInfo;
    skills: string[];
    experience: Experience[];
    education: Education[];
    projects?: Project[];
  };
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string[];
  skills: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  content: string;
  createdAt: Date;
  requirements?: {
    skills: string[];
    experience: string;
    education: string;
  };
  metadata?: {
    location?: string;
    salary?: string;
    type?: string;
    remote?: boolean;
  };
}

export interface AnalysisResult {
  id: string;
  jobTitle: string;
  jobCompany: string;
  jobContent: string;
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  recommendations: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  analyzedAt: Date;
  detailedAnalysis?: {
    keywordMatches: string[];
    experienceAlignment: string[];
    skillGaps: string[];
    recommendations: string[];
  };
}

export interface AnalysisHistory {
  id: string;
  analyses: AnalysisResult[];
  createdAt: Date;
  updatedAt: Date;
}

// Validation types
export interface ResumeValidation {
  isValid: boolean;
  completenessScore: number;
  requiredFields: {
    contactInfo: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
  };
  missingFields: string[];
  suggestions: string[];
  validationErrors: string[];
}

export interface JobValidation {
  isValid: boolean;
  qualityScore: number;
  hasRequirements: boolean;
  hasBasicInfo: boolean;
  missingFields: string[];
  suggestions: string[];
  validationErrors: string[];
}

export interface JobSearch {
  currentQuery: string;
  validationErrors: string[];
  isValid: boolean;
  lastValidated: Date | null;
}

export interface AppState {
  // Single resume focus
  resume: Resume | null;
  isLoggedIn: boolean;
  resumeValidation: ResumeValidation | null;
  loginError: string | null;

  // Job search functionality
  jobSearch: JobSearch;
  searchHistory: JobDescription[];

  // Analysis results
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];

  // UI state
  isLoading: boolean;
  error: string | null;
  uploadProgress: number | undefined;
}