interface AnalysisResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  recommendations: string[];
  missingSkills: string[];
}

interface ResumeData {
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

export async function analyzeResumeMatch(
  resumeData: ResumeData,
  jobDescription: string
): Promise<AnalysisResult> {
  try {
    // Prepare the prompt for the AI model
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

    // API call to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getOpenRouterApiKey()}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Resume Matcher",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free", // You can change the model as needed
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

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the content from the API response
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in API response');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    // Parse the JSON
    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    
    // Store the analysis result in localStorage for persistence
    localStorage.setItem('lastAnalysisResult', JSON.stringify(result));
    localStorage.setItem('lastAnalysisTimestamp', new Date().toISOString());
    
    return result;
  } catch (error) {
    console.error('Error analyzing resume match:', error);
    
    // Return a fallback result for development/testing
    // In production, you would want to handle this error differently
    return {
      overallMatch: 65,
      skillsMatch: 70,
      experienceMatch: 60,
      recommendations: [
        "Could not analyze your resume. Please try again later.",
        "Make sure your OpenRouter API key is correctly set.",
        "Check your network connection and try again."
      ],
      missingSkills: []
    };
  }
}

// Helper function to get the API key
function getOpenRouterApiKey(): string {
  // In a real app, you would get this from a secure storage or env variable
  // For PWA, you might store it in the browser after the user enters it
  const apiKey = localStorage.getItem('openRouterApiKey');
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }
  
  return apiKey;
} 