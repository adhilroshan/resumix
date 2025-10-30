import { Resume } from '@/types';

export async function processFile(file: File): Promise<Resume> {
  const content = await extractTextFromFile(file);
  const parsedData = await parseResumeContent(content);

  return {
    id: generateId(),
    name: file.name,
    content,
    uploadedAt: new Date(),
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    parsedData,
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === 'text/plain' || fileType === 'text/markdown') {
    return await extractTextFromText(file);
  } else if (fileType === 'application/pdf' ||
             fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextViaAPI(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractTextViaAPI(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse-file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse file');
  }

  const result = await response.json();
  return result.text;
}

async function extractTextFromText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        resolve(text);
      } else {
        reject(new Error('Failed to extract text from file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

async function parseResumeContent(content: string) {
  // In a real implementation, you would use NLP or regex to extract structured data
  // For now, we'll provide a basic parsing simulation
  const lines = content.split('\n').filter(line => line.trim());

  const skills = extractSkills(content);
  const experience = extractExperience(content);
  const education = extractEducation(content);
  const contactInfo = extractContactInfo(content);

  return {
    contactInfo,
    skills,
    experience,
    education,
    projects: [],
  };
}

function extractSkills(content: string): string[] {
  // Common skill keywords to look for
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'HTML', 'CSS', 'SQL', 'Git', 'Docker', 'AWS', 'Azure', 'GCP',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Kubernetes', 'Jenkins',
    'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'Microservices',
    'Machine Learning', 'Data Science', 'Analytics', 'Leadership'
  ];

  const foundSkills: string[] = [];
  const lowerContent = content.toLowerCase();

  skillKeywords.forEach(skill => {
    if (lowerContent.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

function extractExperience(content: string): any[] {
  // Simple regex-based experience extraction
  // In a real implementation, this would be much more sophisticated
  const experienceSection = content.match(/experience|work history|employment|career/i);
  if (!experienceSection) return [];

  // Placeholder implementation
  return [
    {
      title: "Software Engineer",
      company: "Example Company",
      duration: "2020 - Present",
      description: ["Developed web applications", "Collaborated with team"],
      skills: ["JavaScript", "React", "Node.js"]
    }
  ];
}

function extractEducation(content: string): any[] {
  // Simple regex-based education extraction
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
  const hasEducation = educationKeywords.some(keyword =>
    content.toLowerCase().includes(keyword)
  );

  if (!hasEducation) return [];

  // Placeholder implementation
  return [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "Example University",
      year: "2016 - 2020",
      gpa: "3.8"
    }
  ];
}

function extractContactInfo(content: string): any {
  // Basic regex patterns for contact information
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const linkedinPattern = /linkedin\.com\/in\/[\w-]+/i;
  const githubPattern = /github\.com\/[\w-]+/i;

  const email = content.match(emailPattern)?.[0];
  const phone = content.match(phonePattern)?.[0];
  const linkedin = content.match(linkedinPattern)?.[0];
  const github = content.match(githubPattern)?.[0];

  return {
    email,
    phone,
    linkedin,
    github,
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}