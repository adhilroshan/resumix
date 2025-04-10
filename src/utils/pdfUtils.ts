import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

// Cache to store already processed PDFs by hash
const pdfTextCache = new Map<string, string>();

/**
 * Generate a hash for a file to use as cache key
 * @param file PDF file to hash
 * @returns Hash based on file name and size
 */
async function generateFileHash(file: File): Promise<string> {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Optimized function to extract text from a PDF file with worker offloading,
 * caching, and chunked processing for large files
 * 
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
      onProgress(5);
    }
    
    // Check cache first
    const fileHash = await generateFileHash(file);
    if (pdfTextCache.has(fileHash)) {
      if (onProgress) {
        onProgress(100);
      }
      return pdfTextCache.get(fileHash)!;
    }

    // Update progress to indicate file reading started
    if (onProgress) {
      onProgress(10);
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Check file size and use chunked processing for large files
    const isLargeFile = arrayBuffer.byteLength > 10 * 1024 * 1024; // 10MB threshold
    
    if (onProgress) {
      onProgress(20);
    }
    
    // Load the PDF document with optimized parameters
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
      cMapPacked: true,
      disableFontFace: true, // Disable custom fonts to improve performance
      useSystemFonts: false,
      // Increase max supported image size to prevent errors with complex documents
      maxImageSize: isLargeFile ? 64000000 : 16000000,
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';
    
    if (onProgress) {
      onProgress(30);
    }
    
    // Process pages in batches for large documents to prevent memory issues
    const BATCH_SIZE = isLargeFile ? 5 : numPages;
    const batches = Math.ceil(numPages / BATCH_SIZE);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startPage = batchIndex * BATCH_SIZE + 1;
      const endPage = Math.min((batchIndex + 1) * BATCH_SIZE, numPages);
      const batchPromises = [];
      
      for (let i = startPage; i <= endPage; i++) {
        batchPromises.push(processPage(pdf, i));
      }
      
      const batchResults = await Promise.all(batchPromises);
      fullText += batchResults.join('\n');
      
      // Update progress based on completed batches
      if (onProgress) {
        const progressValue = 30 + Math.floor(((batchIndex + 1) / batches) * 60);
        onProgress(progressValue);
      }
      
      // Small delay to allow UI thread to breathe between batches
      if (isLargeFile && batchIndex < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // Cache the result for future reuse
    pdfTextCache.set(fileHash, fullText);
    
    if (onProgress) {
      onProgress(100);
    }
    
    return fullText;
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Process a single page of the PDF
 * @param pdf PDF document
 * @param pageNum Page number to process
 * @returns Text content of the page
 */
async function processPage(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> {
  const page = await pdf.getPage(pageNum);
  
  // Get text content with standard parameters
  const textContent = await page.getTextContent();
  
  // Process text items with improved layout preservation
  let lastY = null;
  let text = '';
  
  for (const item of textContent.items) {
    // Type assertion to access the properties we need
    const textItem = item as any;
    
    // Check if we're on a new line by detecting significant Y position change
    if (lastY !== null && Math.abs(textItem.transform[5] - lastY) > 5) {
      text += '\n';
    } else if (text.length > 0 && !text.endsWith('\n') && !text.endsWith(' ')) {
      // Add space between words on the same line if needed
      text += ' ';
    }
    
    text += textItem.str;
    lastY = textItem.transform[5];
  }
  
  return text;
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