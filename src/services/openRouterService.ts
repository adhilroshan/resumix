import { StorageService } from './storageService'; // Import StorageService
import { addPendingAnalysis } from '../utils/indexedDbUtils'; // Import IndexedDB utility

// Remove unused interfaces
// interface AnalysisResult { ... }
// interface ResumeData { ... }

// Define a more specific type for resume data used in analysis
interface AnalysisResumeData {
  resumeText: string;
  userInfo: {
    fullName: string;
    jobTitle: string;
    yearsOfExperience: string;
    educationLevel: string;
    bio: string;
  };
  skills: string[];
}

// Interface for the result expected from the API (before adding jobDescription/timestamp)
interface ApiResponseResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  recommendations: string[];
  missingSkills: string[];
}

// Helper function for retrying async operations with delay
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 500 // ms
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        console.warn(`Operation failed, retrying in ${delay}ms... (${i + 1}/${retries})`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Optional: exponential backoff
      } else {
        console.error(`Operation failed after ${retries} retries.`, error);
      }
    }
  }
  throw lastError; // Re-throw the last error if all retries fail
}

export async function analyzeResumeMatch(
  resumeData: AnalysisResumeData,
  jobDescription: string,
): Promise<ApiResponseResult> { // Return type from API
  const apiKey = getOpenRouterApiKey();
  const prompt = `
    You are an expert resume and job application advisor. Analyze the match between the candidate's resume and the job description provided.

    RESUME INFORMATION:
    ---
    ${resumeData.resumeText}

    USER INFORMATION:
    ---
    Name: ${resumeData.userInfo.fullName}
    Current/Desired Title: ${resumeData.userInfo.jobTitle}
    Years of Experience: ${resumeData.userInfo.yearsOfExperience}
    Education: ${resumeData.userInfo.educationLevel}
    Professional Summary: ${resumeData.userInfo.bio}

    SKILLS:
    ---
    ${resumeData.skills.join(', ')}

    JOB DESCRIPTION:
    ---
    ${jobDescription}

    Please provide a structured analysis of the match between the resume and the job description with the following information:
    1. Overall match percentage (0-100)
    2. Skills match percentage (0-100)
    3. Experience match percentage (0-100)
    4. List of 3-5 specific recommendations to improve the resume for this job
    5. List of key skills mentioned in the job description that are missing from the resume

    Format your response as a valid JSON object with the following structure:
    {
      "overallMatch": number,
      "skillsMatch": number,
      "experienceMatch": number,
      "recommendations": [string, string, ...],
      "missingSkills": [string, string, ...]
    }
    `;

  try {
    const response = await retryOperation(async () => {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '', // Check if window exists
            "X-Title": "Resume Matcher",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        }
      );

      if (!res.ok) {
        // Throw an error for non-successful responses to trigger retry
        throw new Error(`API request failed with status ${res.status}`);
      }
      return res;
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No content in API response');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Raw response content:", content);
      throw new Error('Could not extract valid JSON from API response');
    }

    let result: ApiResponseResult;
    try {
      result = JSON.parse(jsonMatch[0]) as ApiResponseResult;
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonMatch[0], parseError);
      throw new Error('Failed to parse JSON from API response');
    }

    if (typeof result.overallMatch !== 'number' || typeof result.skillsMatch !== 'number' || typeof result.experienceMatch !== 'number' || !Array.isArray(result.recommendations) || !Array.isArray(result.missingSkills)) {
      console.error("Invalid JSON structure received:", result);
      throw new Error('Invalid structure in API response JSON');
    }

    // Save successful result directly to StorageService (which handles history)
    StorageService.saveAnalysisResult(
      { ...result, jobDescription: jobDescription },
      jobDescription
    );

    return result;
  } catch (error) {
    console.error('Error analyzing resume match:', error);

    // Check if Background Sync is available and error seems network-related
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready && 'SyncManager' in window && error instanceof Error && error.message.includes('fetch')) {
      try {
        console.log('Network error detected, attempting to queue for background sync...');
        const registration = await navigator.serviceWorker.ready;
        await addPendingAnalysis({ // Save data to IndexedDB
          timestamp: Date.now(),
          resumeData: resumeData,
          jobDescription: jobDescription,
          apiKey: apiKey // Store the key used for the attempt
        });
        await (registration as any).sync.register('sync-analysis'); // Register sync event
        console.log('Analysis request queued for background sync.');
        // Throw a specific error or return a value indicating queuing
        throw new Error('Network error: Analysis request queued for background sync.');
      } catch (syncError) {
        console.error('Failed to queue analysis for background sync:', syncError);
        // Fallback: re-throw the original error if queuing fails
        throw error;
      }
    } else {
      // If sync isn't available or it's not a network error, re-throw original error
      throw error;
    }
  }
}

// Helper function to get the API key
function getOpenRouterApiKey(): string {
  const apiKey = StorageService.getOpenRouterApiKey(); // Use StorageService

  if (!apiKey) {
    // Throwing error here is correct, as the operation cannot proceed without a key.
    // The UI should handle this state gracefully (e.g., prompt user for key).
    throw new Error('OpenRouter API key not found in storage. Please set it in the dashboard.');
  }

  return apiKey;
} 