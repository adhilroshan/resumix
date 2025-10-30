import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent } = await request.json();

    if (!resumeContent || typeof resumeContent !== 'string') {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }

    const validation = await validateResume(resumeContent);
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Resume validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate resume' },
      { status: 500 }
    );
  }
}

async function validateResume(content: string) {
  const validation: {
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
  } = {
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
    validationErrors: [],
  };

  const lowerContent = content.toLowerCase();

  // Check contact info
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const hasEmail = emailPattern.test(content);
  const hasPhone = phonePattern.test(content);

  if (hasEmail || hasPhone) {
    validation.requiredFields.contactInfo = true;
  } else {
    validation.missingFields.push('Contact Information (email or phone)');
    validation.suggestions.push('Add your email address and/or phone number');
  }

  // Check skills
  const skillKeywords = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'java',
    'html', 'css', 'sql', 'git', 'docker', 'aws', 'azure', 'gcp',
    'mongodb', 'postgresql', 'mysql', 'redis', 'kubernetes', 'jenkins',
    'ci/cd', 'agile', 'scrum', 'rest api', 'graphql', 'microservices',
    'machine learning', 'data science', 'analytics', 'leadership'
  ];

  const foundSkills = skillKeywords.filter(skill => lowerContent.includes(skill));
  if (foundSkills.length > 0) {
    validation.requiredFields.skills = true;
  } else {
    validation.missingFields.push('Skills');
    validation.suggestions.push('List your technical and professional skills');
  }

  // Check experience
  const experienceKeywords = ['experience', 'work history', 'employment', 'career'];
  const hasExperienceSection = experienceKeywords.some(keyword => lowerContent.includes(keyword));
  const hasJobTitles = /\b(senior|junior|lead|principal|manager|director|engineer|developer|analyst|specialist|coordinator)\b/i.test(content);

  if (hasExperienceSection || hasJobTitles) {
    validation.requiredFields.experience = true;
  } else {
    validation.missingFields.push('Work Experience');
    validation.suggestions.push('Add your work experience with job titles and companies');
  }

  // Check education
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'diploma', 'certification'];
  const hasEducation = educationKeywords.some(keyword => lowerContent.includes(keyword));

  if (hasEducation) {
    validation.requiredFields.education = true;
  } else {
    validation.missingFields.push('Education');
    validation.suggestions.push('Add your educational background');
  }

  // Calculate completeness score
  const fieldCount = Object.values(validation.requiredFields).filter(Boolean).length;
  validation.completenessScore = (fieldCount / 4) * 100;
  validation.isValid = validation.completenessScore === 100;

  return validation;
}