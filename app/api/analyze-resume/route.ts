import { NextRequest, NextResponse } from "next/server";
import { parseAIResponse } from "@/lib/json-extractor";

interface AnalysisRequest {
  resume: {
    name: string;
    content: string;
    parsedData?: {
      skills?: string[];
      experience?: Array<{
        title: string;
        company: string;
        duration: string;
      }>;
      education?: Array<{
        degree: string;
        institution: string;
        year: string;
      }>;
    };
  };
  job: {
    title: string;
    company: string;
    content: string;
  };
}

interface AnalysisResponse {
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

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    // Validate required fields
    if (!body.resume || !body.job) {
      return NextResponse.json(
        { error: "Resume and job data are required" },
        { status: 400 },
      );
    }

    if (!body.resume.content || !body.job.content) {
      return NextResponse.json(
        { error: "Resume content and job content are required" },
        { status: 400 },
      );
    }

    // Get API key from server-side environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OpenRouter API key not configured");
      return NextResponse.json(
        { error: "Analysis service temporarily unavailable" },
        { status: 500 },
      );
    }

    // Build the enhanced prompt
    const prompt = buildAnalysisPrompt(body.resume, body.job);

    // Call OpenRouter API from server-side
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "system",
              content: `You are an expert career counselor and resume analyst. Your task is to analyze how well a resume matches a job description and provide detailed, actionable feedback.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. You MUST respond with PURE JSON ONLY - no markdown, no code blocks, no explanations
2. DO NOT use \`\`\`json or \`\`\` or any formatting around the JSON
3. Your entire response must be a single valid JSON object starting with { and ending with }
4. Include ALL required fields as specified below
5. Do not add any text before or after the JSON object

RESPONSE FORMAT - EXACT STRUCTURE REQUIRED:
{
  "overallMatch": number between 0-100,
  "skillsMatch": number between 0-100,
  "experienceMatch": number between 0-100,
  "educationMatch": number between 0-100,
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2"],
  "missingSkills": ["critical missing skill 1", "important missing skill 2"],
  "strengths": ["key strength that makes them a good fit 1", "key strength that makes them a good fit 2"],
  "improvements": ["specific area for improvement 1", "specific area for improvement 2"],
  "detailedAnalysis": {
    "keywordMatches": ["matching keywords found in both resume and job description"],
    "experienceAlignment": ["specific ways their experience aligns with job requirements"],
    "skillGaps": ["specific gaps between their skills and required skills"],
    "recommendations": ["detailed recommendations for resume improvement"]
  }
}

EXAMPLE OF CORRECT RESPONSE FORMAT:
{"overallMatch": 75, "skillsMatch": 80, "experienceMatch": 70, "educationMatch": 85, "recommendations": ["Add agile methodology keywords"], "missingSkills": ["React experience"], "strengths": ["Strong leadership background"], "improvements": ["Quantify achievements"], "detailedAnalysis": {"keywordMatches": ["project management"], "experienceAlignment": ["5 years management experience"], "skillGaps": ["missing technical skills"], "recommendations": ["certification suggestions"]}}

EXAMPLE OF INCORRECT RESPONSE FORMAT:
\`\`\`json
{"overallMatch": 75, ...}
\`\`\`

Remember: PURE JSON ONLY - NO MARKDOWN CODE BLOCKS!`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "OpenRouter API error:",
        response.status,
        response.statusText,
      );
      return NextResponse.json(
        { error: "Analysis service temporarily unavailable" },
        { status: 502 },
      );
    }

    const data = await response.json();

    // Parse the AI response with enhanced error handling
    let analysisData;
    try {
      const rawResponse = data.choices[0].message.content;
      console.log("Raw AI response received:", rawResponse);

      // Use our enhanced parsing function that handles markdown code blocks
      analysisData = parseAIResponse(rawResponse);
      console.log("Successfully parsed AI response");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response that failed:", data.choices[0].message.content);

      return NextResponse.json(
        {
          error: "Analysis service temporarily unavailable",
          details: "AI response parsing failed. Please try again.",
          debug: process.env.NODE_ENV === 'development' ? {
            rawResponse: data.choices[0].message.content,
            error: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
          } : undefined
        },
        { status: 502 },
      );
    }

    // Build the response
    const analysisResult: AnalysisResponse = {
      id: generateId(),
      jobTitle: body.job.title,
      jobCompany: body.job.company,
      jobContent: body.job.content,
      overallMatch: analysisData.overallMatch || 0,
      skillsMatch: analysisData.skillsMatch || 0,
      experienceMatch: analysisData.experienceMatch || 0,
      educationMatch: analysisData.educationMatch || 0,
      recommendations: analysisData.recommendations || [],
      missingSkills: analysisData.missingSkills || [],
      strengths: analysisData.strengths || [],
      improvements: analysisData.improvements || [],
      analyzedAt: new Date(),
      detailedAnalysis: analysisData.detailedAnalysis,
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Analysis service temporarily unavailable" },
      { status: 500 },
    );
  }
}

function buildAnalysisPrompt(
  resume: AnalysisRequest["resume"],
  job: AnalysisRequest["job"],
): string {
  return `
    You are an expert career coach and resume analyst conducting a comprehensive compatibility analysis between a candidate's resume and a specific job opportunity. This analysis will help the candidate understand their fit and take concrete steps to improve their chances.

    CANDIDATE PROFILE:
    Name: ${resume.name}
    Resume Summary: ${resume.content}

    Key Skills: ${resume.parsedData?.skills?.join(", ") || "Not specified"}

    Professional Experience:
    ${
      resume.parsedData?.experience
        ?.map((exp) => `• ${exp.title} at ${exp.company} (${exp.duration})`)
        .join("\n") || "Not specified"
    }

    Education:
    ${
      resume.parsedData?.education
        ?.map((edu) => `• ${edu.degree} from ${edu.institution} (${edu.year})`)
        .join("\n") || "Not specified"
    }

    TARGET OPPORTUNITY:
    Position: ${job.title}
    Company: ${job.company}
    Job Description: ${job.content}

    TASK: Conduct a detailed analysis and provide specific, actionable feedback.

    CRITICAL: Your response must be PURE JSON ONLY - no markdown, no explanations, no code blocks.
    Start your response immediately with { and end with }.

    REQUIRED JSON FORMAT (copy this structure exactly):
    {
      "overallMatch": number between 0-100,
      "skillsMatch": number between 0-100,
      "experienceMatch": number between 0-100,
      "educationMatch": number between 0-100,
      "recommendations": ["Specific, actionable recommendation 1", "Specific, actionable recommendation 2"],
      "missingSkills": ["Critical missing skill 1", "Important missing skill 2"],
      "strengths": ["Key strength that makes them a good fit 1", "Key strength that makes them a good fit 2"],
      "improvements": ["Specific area for improvement 1", "Specific area for improvement 2"],
      "detailedAnalysis": {
        "keywordMatches": ["Matching keywords found in both resume and job description"],
        "experienceAlignment": ["Specific ways their experience aligns with job requirements"],
        "skillGaps": ["Specific gaps between their skills and required skills"],
        "recommendations": ["Detailed recommendations for resume improvement"]
      }
    }

    REMEMBER: Respond with JSON only - no \`\`\`json\`\`\` blocks!

    ANALYSIS CRITERIA:
    1. **Overall Match**: Consider the complete picture - skills, experience, education, and potential
    2. **Skills Match**: Compare their existing skills against job requirements, including transferable skills
    3. **Experience Match**: Evaluate how well their experience level and type aligns with what the role demands
    4. **Education Match**: Assess educational requirements and how their background fits

    GUIDELINES FOR RECOMMENDATIONS:
    - Be specific and actionable (e.g., "Add the word 'agile' to your project management experience" instead of "mention agile")
    - Prioritize high-impact improvements that could significantly increase their match score
    - Consider both hard skills and soft skills
    - Suggest ways to frame existing experience to better match the job requirements
    - Recommend specific keywords or phrases to include

    Focus on providing practical, immediately usable advice that will help this candidate tailor their resume specifically for this opportunity and increase their chances of getting an interview.
    `;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
