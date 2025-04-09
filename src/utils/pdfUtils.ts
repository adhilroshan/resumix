import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Extracts text from a PDF file
 * @param file PDF file to extract text from
 * @param onProgress Progress callback (0-100)
 * @returns Promise with the extracted text
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Show initial progress
    if (onProgress) {
      onProgress(10);
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress(Math.floor((i / numPages) * 100));
      }
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      fullText += textItems + '\n';
    }

    return fullText;
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extracts potential skills from resume text using common skill keywords
 * @param resumeText The text content of the resume
 * @returns Array of potential skills found in the resume
 */
export function extractPotentialSkills(resumeText: string): string[] {
  // Common technical skills to look for
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 
    'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'HTML', 'CSS', 'Sass', 'LESS', 'Bootstrap', 'Tailwind', 'Material UI',
    'Redux', 'GraphQL', 'REST API', 'Python', 'Java', 'C#', 'C++',
    'Swift', 'Kotlin', 'Flutter', 'React Native', 'Agile', 'Scrum',
    'Project Management', 'UI/UX', 'Figma', 'Adobe XD', 'Photoshop',
    'Illustrator', 'Testing', 'Jest', 'Cypress', 'Selenium', 'TDD',
    'DevOps', 'Linux', 'Windows', 'MacOS', 'PHP', 'Ruby', 'Rails',
    'Django', 'Flask', 'Spring', 'ASP.NET', '.NET Core'
  ];
  
  const foundSkills: string[] = [];
  const text = resumeText.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

/**
 * Attempts to extract contact info from resume text
 * @param resumeText The text content of the resume
 * @returns Object with extracted contact information
 */
export function extractContactInfo(resumeText: string): {
  email: string | null;
  phone: string | null;
  name: string | null;
} {
  // Email regex pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = resumeText.match(emailRegex);
  
  // Phone regex pattern (simple version)
  const phoneRegex = /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  const phoneMatch = resumeText.match(phoneRegex);
  
  // Name is harder to extract reliably, this is a simple heuristic
  // that assumes the name is at the beginning of the resume
  const lines = resumeText.split('\n').filter(line => line.trim().length > 0);
  const potentialName = lines.length > 0 ? lines[0].trim() : null;
  
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    name: potentialName && potentialName.length < 50 ? potentialName : null
  };
} 