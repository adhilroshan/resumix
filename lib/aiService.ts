import { Resume, JobDescription, AnalysisResult } from '@/types';

export class AIService {
  async analyzeResumeJobMatch(resume: Resume, job: JobDescription): Promise<AnalysisResult> {
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: {
            name: resume.name,
            content: resume.content,
            parsedData: resume.parsedData,
          },
          job: {
            title: job.title,
            company: job.company,
            content: job.content,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }

      const analysisResult = await response.json();

      // Convert the response to match our AnalysisResult interface
      return {
        id: analysisResult.id,
        jobTitle: analysisResult.jobTitle,
        jobCompany: analysisResult.jobCompany,
        jobContent: analysisResult.jobContent,
        overallMatch: analysisResult.overallMatch,
        skillsMatch: analysisResult.skillsMatch,
        experienceMatch: analysisResult.experienceMatch,
        educationMatch: analysisResult.educationMatch,
        recommendations: analysisResult.recommendations,
        missingSkills: analysisResult.missingSkills,
        strengths: analysisResult.strengths,
        improvements: analysisResult.improvements,
        analyzedAt: new Date(analysisResult.analyzedAt),
        detailedAnalysis: analysisResult.detailedAnalysis,
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Analysis service temporarily unavailable')) {
          throw new Error('AI analysis service is temporarily unavailable. Please try again in a few minutes.');
        }
        if (error.message.includes('Resume and job data are required')) {
          throw new Error('Missing required information for analysis.');
        }
        throw new Error(`Analysis failed: ${error.message}`);
      }

      throw new Error('Failed to analyze resume-job compatibility. Please try again.');
    }
  }
}

// Create a singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    // No API key needed on client-side anymore - all calls go through our secure server API
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}