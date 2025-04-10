export interface AnalysisResumeData {
  jobDescription?: string;
  resume?: string;
  fields?: string[];
  temperature?: number;
  result?: string;
  model?: string;
  score?: number;
  matchPercentage?: number;
  keySkills?: string[];
  missingSkills?: string[];
  recommendations?: string[];
  analysis?: string;
}

export interface ApiResponseResult {
  score?: number;
  matchPercentage?: number;
  keySkills?: string[];
  missingSkills?: string[];
  recommendations?: string[];
  analysis?: string;
  error?: string;
} 