import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobContent } = await request.json();

    if (!jobContent || typeof jobContent !== 'string') {
      return NextResponse.json({ error: 'Job description content is required' }, { status: 400 });
    }

    const validation = await validateJobDescription(jobContent);
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Job validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate job description' },
      { status: 500 }
    );
  }
}

async function validateJobDescription(content: string) {
  const validation: {
    isValid: boolean;
    qualityScore: number;
    hasRequirements: boolean;
    hasBasicInfo: boolean;
    missingFields: string[];
    suggestions: string[];
    validationErrors: string[];
  } = {
    isValid: false,
    qualityScore: 0,
    hasRequirements: false,
    hasBasicInfo: false,
    missingFields: [],
    suggestions: [],
    validationErrors: [],
  };

  const lowerContent = content.toLowerCase();
  const wordCount = content.split(/\s+/).length;

  // Check for basic job info (title and company)
  const hasTitle = wordCount > 20; // Basic check for substantial content
  const hasCompany = /\b(company|at|@)\b/i.test(content) || /\b[A-Z][a-z]+\s+(Inc\.|LLC|Corp\.|Ltd\.|Corporation)\b/i.test(content);

  if (hasTitle && hasCompany) {
    validation.hasBasicInfo = true;
  } else if (hasTitle) {
    validation.hasBasicInfo = true;
    validation.suggestions.push('Consider adding company information for better context');
  } else {
    validation.missingFields.push('Job Title and Company Information');
    validation.suggestions.push('Ensure the job description includes a clear job title and company name');
  }

  // Check for requirements/qualifications
  const requirementKeywords = [
    'requirements', 'qualifications', 'skills', 'experience',
    'must have', 'required', 'responsibilities', 'duties',
    'what you\'ll need', 'what we\'re looking for', 'ideal candidate'
  ];

  const hasRequirements = requirementKeywords.some(keyword => lowerContent.includes(keyword));

  // Check for specific skill mentions
  const skillPatterns = [
    /\b(years? of experience|years?\+?)\b/i,
    /\b(bachelor|master|phd|degree)\b/i,
    /\b(javascript|python|java|react|node\.js|sql)\b/i,
    /\b(communication|leadership|teamwork|problem[- ]?solving)\b/i
  ];

  const hasSpecificSkills = skillPatterns.some(pattern => pattern.test(content));

  if (hasRequirements || hasSpecificSkills) {
    validation.hasRequirements = true;
  } else {
    validation.missingFields.push('Job Requirements or Qualifications');
    validation.suggestions.push('Ensure the job description includes required skills and qualifications');
  }

  // Additional quality checks
  let score = 0;
  if (validation.hasBasicInfo) score += 35;
  if (validation.hasRequirements) score += 35;

  // Bonus points for comprehensive content
  if (wordCount > 100) score += 10;
  if (wordCount > 200) score += 10;
  if (/benefits|salary|compensation/i.test(content)) score += 10;

  validation.qualityScore = Math.min(100, score);
  validation.isValid = validation.qualityScore >= 70;

  if (!validation.isValid) {
    if (validation.qualityScore < 50) {
      validation.suggestions.push('Consider adding more specific details about the role and requirements');
    }
    if (validation.qualityScore >= 50 && validation.qualityScore < 70) {
      validation.suggestions.push('Good start! Consider adding more details about responsibilities and company culture');
    }
  }

  return validation;
}