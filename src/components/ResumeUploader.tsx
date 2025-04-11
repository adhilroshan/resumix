import { useState, useRef } from 'react';
import { 
  Group, 
  Text, 
  Button, 
  rem, 
  Paper, 
  Stack,
  SegmentedControl,
  Alert,
  Box,
  Center,
  RingProgress,
  ThemeIcon,
  Badge,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import type { FileWithPath } from 'react-dropzone';
import { 
  IconUpload, 
  IconFile, 
  IconX, 
  IconFileTypePdf, 
  IconFileTypeDoc, 
  IconFileText, 
  IconAlertCircle,
  IconInfoCircle,
  IconCheck,
  IconUser,
  IconMail,
  IconPhone,
  IconFileDescription,
  IconDeviceDesktopAnalytics,
  IconStar
} from '@tabler/icons-react';
import { useResponsiveSizes } from '../components/ResponsiveContainer';
import { StorageService } from '../services/storageService';
import { extractTextFromPDF, extractPotentialSkills, extractContactInfo } from '../utils/pdfUtils';
import type { UserInformation } from '../services/storageService';

// Helper function to get file type icon
const getFileTypeIcon = (fileType: string, size: number = 18) => {
  switch (fileType) {
    case 'application/pdf':
      return <IconFileTypePdf size={size} stroke={1.5} />;
    case 'text/plain':
      return <IconFileText size={size} stroke={1.5} />;
    case 'text/x-tex':
    case 'application/x-tex':
      return <IconFileTypeDoc size={size} stroke={1.5} />;
    default:
      return <IconFile size={size} stroke={1.5} />;
  }
};

interface ResumeUploaderProps {
  onResumeText: (text: string, fileName: string) => void;
  isLoading?: boolean;
  showVerification?: boolean;
}

export function ResumeUploader({ 
  onResumeText, 
  isLoading = false,
  showVerification = true
}: ResumeUploaderProps) {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [uploadFormat, setUploadFormat] = useState<'pdf' | 'text' | 'latex'>('pdf');
  const [error, setError] = useState<string | null>(null);
  const openRef = useRef<() => void>(null);
  const responsiveSizes = useResponsiveSizes();
  const isSmall = responsiveSizes.isSmall;

  // Verification state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [extractedData, setExtractedData] = useState<{
    skills: string[];
    contactInfo: { name: string | null; email: string | null; phone: string | null };
  } | null>(null);
  
  // Generate accepted MIME types based on selected format
  const getAcceptedFileTypes = () => {
    switch (uploadFormat) {
      case 'pdf':
        return ['application/pdf'];
      case 'text':
        return ['text/plain'];
      case 'latex':
        return ['text/x-tex', 'application/x-tex'];
      default:
        return ['application/pdf', 'text/plain', 'text/x-tex', 'application/x-tex'];
    }
  };
  
  // Handle file drop
  const handleDrop = async (files: FileWithPath[]) => {
    setError(null);
    setSuccess(false);
    setExtractedData(null);
    
    if (files.length === 0) return;
    
    const file = files[0];
    setFile(file);
    
    // Process file based on type
    if (file.type === 'application/pdf') {
      if (showVerification) {
        // We'll process the PDF in the verify step
      } else {
        // Simple processing without verification
        processFile(file);
      }
    } else if (file.type === 'text/plain') {
      // Text file processing
      parseTextFile(file);
    } else if (file.type === 'text/x-tex' || file.type === 'application/x-tex') {
      // LaTeX file processing
      parseLatexFile(file);
    } else {
      setError(`Unsupported file type: ${file.type}`);
    }
  };
  
  // Process the uploaded file
  const processFile = (file: FileWithPath) => {
    if (file.type === 'application/pdf') {
      // PDF content will be extracted by parent component
      onResumeText('', file.name);
    }
  };
  
  // Parse text file content
  const parseTextFile = async (file: FileWithPath) => {
    if (showVerification) {
      setIsProcessing(true);
      setProcessingStage('Reading text file...');
      setProgress(20);
    }

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        if (showVerification) {
          setProgress(50);
          setProcessingStage('Analyzing content...');
          
          // Extract skills and contact info
          const skills = extractPotentialSkills(text);
          const contactInfo = extractContactInfo(text);
          
          setExtractedData({ skills, contactInfo });
          updateUserProfile(text, file.name, skills, contactInfo, 'text');
          
          setProgress(100);
          setIsProcessing(false);
          setSuccess(true);
        }
        
        onResumeText(text, file.name);
      };
      
      reader.onerror = () => {
        setError('Failed to read text file. Please try again.');
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError('Error processing file. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Parse LaTeX file content
  const parseLatexFile = async (file: FileWithPath) => {
    if (showVerification) {
      setIsProcessing(true);
      setProcessingStage('Reading LaTeX file...');
      setProgress(20);
    }

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Simple LaTeX parsing - remove commands but keep content
        const cleanedText = text
          .replace(/\\begin\{.*?\}|\\\end\{.*?\}/g, '') // Remove begin/end environments
          .replace(/\\[a-zA-Z]+(\{.*?\})?/g, '$1')      // Remove commands but keep their arguments
          .replace(/\\\\/g, '\n')                        // Convert newlines
          .replace(/\s+/g, ' ')                          // Normalize whitespace
          .trim();
        
        if (showVerification) {
          setProgress(50);
          setProcessingStage('Analyzing content...');
          
          // Extract skills and contact info
          const skills = extractPotentialSkills(cleanedText);
          const contactInfo = extractContactInfo(cleanedText);
          
          setExtractedData({ skills, contactInfo });
          updateUserProfile(cleanedText, file.name, skills, contactInfo, 'latex');
          
          setProgress(100);
          setIsProcessing(false);
          setSuccess(true);
        }
        
        onResumeText(cleanedText, file.name);
      };
      
      reader.onerror = () => {
        setError('Failed to read LaTeX file. Please try again.');
        setIsProcessing(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError('Error processing file. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Process PDF with verification
  const processPDF = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('Extracting text from PDF...');
    
    try {
      // Extract text from PDF using our utility function
      const text = await extractTextFromPDF(file, (progressValue) => {
        setProgress(progressValue);
        if (progressValue < 20) {
          setProcessingStage('Initializing PDF processor...');
        } else if (progressValue < 40) {
          setProcessingStage('Reading document structure...');
        } else if (progressValue < 60) {
          setProcessingStage('Extracting text from pages...');
        } else if (progressValue < 80) {
          setProcessingStage('Processing content...');
        } else if (progressValue < 95) {
          setProcessingStage('Analyzing document text...');
        } else {
          setProcessingStage('Finalizing analysis...');
        }
      });
      
      // Extract potential skills and contact info
      const skills = extractPotentialSkills(text);
      const contactInfo = extractContactInfo(text);
      
      setExtractedData({ skills, contactInfo });
      
      // Update user profile
      updateUserProfile(text, file.name, skills, contactInfo, 'pdf');
      
      // Set success
      setSuccess(true);
      
      // Call callback
      onResumeText(text, file.name);
    } catch (err) {
      setError('Error processing PDF. Please try another file.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Update user profile information
  const updateUserProfile = (
    text: string, 
    fileName: string, 
    skills: string[], 
    contactInfo: { name: string | null; email: string | null; phone: string | null },
    sourceType: 'pdf' | 'text' | 'latex'
  ) => {
    // Save resume data
    StorageService.saveResumeData({
      resumeText: text,
      fileName,
      uploadDate: new Date().toISOString(),
      sourceType
    });
    
    // Store detected skills for later use
    if (skills.length > 0) {
      const existingSkills = StorageService.getUserSkills();
      const mergedSkills = [...new Set([...existingSkills, ...skills])];
      StorageService.saveUserSkills(mergedSkills);
    }
    
    // If we found contact info, update the user information
    if (contactInfo.email || contactInfo.phone || contactInfo.name) {
      const currentUserInfo = StorageService.getUserInformation() || {} as UserInformation;
      
      const updatedUserInfo: UserInformation = {
        ...currentUserInfo,
        fullName: contactInfo.name || currentUserInfo.fullName || '',
        email: contactInfo.email || currentUserInfo.email || '',
        phone: contactInfo.phone || currentUserInfo.phone || '',
        location: currentUserInfo.location || '',
        jobTitle: currentUserInfo.jobTitle || '',
        yearsOfExperience: currentUserInfo.yearsOfExperience || '',
        educationLevel: currentUserInfo.educationLevel || '',
        bio: currentUserInfo.bio || ''
      };
      
      StorageService.saveUserInformation(updatedUserInfo);
    }
  };
  
  // Format support info
  const formatInfo = {
    pdf: 'Upload a PDF resume for automatic parsing',
    text: 'Plain text (.txt) resumes are directly read without parsing',
    latex: 'LaTeX (.tex) resumes will have commands removed and content extracted'
  };
  
  return (
    <Paper p={isSmall ? "sm" : "md"} withBorder radius="md" className="modern-card resume-upload-paper">
      <Stack gap={isSmall ? "xs" : "md"}>
        <Group justify="apart" wrap={isSmall ? "wrap" : "nowrap"}>
          <Text fw={500} size={isSmall ? "sm" : undefined}>Upload Your Resume</Text>
          <Box mt={isSmall ? "xs" : 0} w={isSmall ? "100%" : "auto"}>
            <SegmentedControl
              value={uploadFormat}
              onChange={(value) => setUploadFormat(value as 'pdf' | 'text' | 'latex')}
              data={[
                { label: 'PDF', value: 'pdf' },
                { label: 'Text', value: 'text' },
                { label: 'LaTeX', value: 'latex' }
              ]}
              size={isSmall ? "xs" : "sm"}
              fullWidth={isSmall}
              styles={isSmall ? {
                root: { width: '100%' },
                label: { padding: '5px 8px', fontSize: '12px' }
              } : undefined}
              classNames={{
                root: 'touch-ripple'
              }}
            />
          </Box>
        </Group>
        
        <Alert 
          icon={<IconInfoCircle size={isSmall ? 12 : 14} stroke={1.5} />} 
          variant="light"
          color="blue"
          p={isSmall ? "xs" : "sm"}
        >
          <Text size={isSmall ? "xs" : "sm"}>{formatInfo[uploadFormat]}</Text>
        </Alert>
        
        {error && (
          <Alert 
            icon={<IconAlertCircle size={isSmall ? 12 : 14} stroke={1.5} />} 
            color="red" 
            title="Upload Error" 
            p={isSmall ? "xs" : "md"}
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <Text size={isSmall ? "xs" : "sm"}>{error}</Text>
          </Alert>
        )}
        
        {!isProcessing && !success ? (
          <>
            <Dropzone
              onDrop={handleDrop}
              maxSize={5 * 1024 * 1024}
              accept={getAcceptedFileTypes()}
              loading={isLoading}
              openRef={openRef}
              h={isSmall ? 150 : 180}
              p={isSmall ? "xs" : "md"}
              className="upload-box touch-ripple"
              styles={isSmall ? {
                root: { borderWidth: '1px' }
              } : undefined}
            >
              <Group justify="center" gap={isSmall ? "sm" : "xl"} style={{ minHeight: rem(isSmall ? 100 : 120), pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={isSmall ? 22 : 28} stroke={1.5} className="cloud-icon" />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={isSmall ? 22 : 28} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  {file ? (
                    <Stack gap={isSmall ? "8px" : "xs"} align="center">
                      {getFileTypeIcon(file.type, isSmall ? 16 : 20)}
                      <Text size={isSmall ? "xs" : "sm"} inline>
                        {file.name}
                      </Text>
                    </Stack>
                  ) : (
                    <Stack gap={isSmall ? "8px" : "xs"} align="center">
                      <IconUpload size={isSmall ? 22 : 28} stroke={1.5} className="cloud-icon" />
                      <div>
                        <Text size={isSmall ? "sm" : "md"} fw={500} inline ta="center">
                          Drag resume here
                        </Text>
                        <Text size={isSmall ? "xs" : "sm"} color="dimmed" inline mt={4} ta="center">
                          Upload {uploadFormat.toUpperCase()} file
                        </Text>
                      </div>
                    </Stack>
                  )}
                </Dropzone.Idle>
              </Group>
            </Dropzone>
            
            <Group justify="center">
              <Button 
                onClick={() => openRef.current?.()}
                leftSection={<IconUpload size={isSmall ? 12 : 14} stroke={1.5} />}
                disabled={isLoading}
                size={isSmall ? "sm" : "md"}
                fullWidth={isSmall}
                h={isSmall ? 40 : undefined}
                mt={isSmall ? 5 : undefined}
                className="upload-button touch-ripple"
              >
                Select File
              </Button>
            </Group>
            
            {file && file.type === 'application/pdf' && showVerification && (
              <Group justify="center" mt={isSmall ? "xs" : "sm"}>
                <Button 
                  color="blue"
                  onClick={processPDF}
                  leftSection={<IconFileTypePdf size={isSmall ? 12 : 14} stroke={1.5} />}
                  size={isSmall ? "sm" : "md"}
                  fullWidth={isSmall}
                  className="action-button touch-ripple"
                  style={{
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)'
                  }}
                >
                  Process PDF
                </Button>
              </Group>
            )}
          </>
        ) : isProcessing ? (
          <Box py="lg" className="processing-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Stack gap="md" align="center">
              <Text fw={500} ta="center" size={isSmall ? "sm" : "md"}>
                {processingStage}
              </Text>
              
              <RingProgress
                sections={[{ value: progress, color: 'blue' }]}
                size={isSmall ? 120 : 150}
                thickness={12}
                roundCaps
                className="ring-progress"
                label={
                  <Center>
                    <Text fw={700} ta="center" size={isSmall ? "lg" : "xl"} className="ring-progress-label">
                      {Math.round(progress)}%
                    </Text>
                  </Center>
                }
              />
              
              {/* Detailed processing stages */}
              <Paper withBorder p="md" radius="md" shadow="sm" w="100%" className="modern-card">
                <Stack gap="xs">
                  <ProcessingStageItem 
                    icon={<IconFileTypePdf size={18} />}
                    label="Document loading"
                    isActive={progress < 20}
                    isCompleted={progress >= 20}
                  />
                  <ProcessingStageItem 
                    icon={<IconFileDescription size={18} />}
                    label="Reading structure"
                    isActive={progress >= 20 && progress < 40}
                    isCompleted={progress >= 40}
                  />
                  <ProcessingStageItem 
                    icon={<IconFileText size={18} />}
                    label="Text extraction"
                    isActive={progress >= 40 && progress < 60}
                    isCompleted={progress >= 60}
                  />
                  <ProcessingStageItem 
                    icon={<IconDeviceDesktopAnalytics size={18} />}
                    label="Content analysis"
                    isActive={progress >= 60 && progress < 80}
                    isCompleted={progress >= 80}
                  />
                  <ProcessingStageItem 
                    icon={<IconStar size={18} />}
                    label="Skills detection"
                    isActive={progress >= 80 && progress < 95}
                    isCompleted={progress >= 95}
                  />
                </Stack>
              </Paper>
              
              <Text size="xs" color="dimmed" maw={400} ta="center">
                Processing time depends on the size and complexity of your PDF. Please don't close this window.
              </Text>
            </Stack>
          </Box>
        ) : success && showVerification ? (
          <Box py="md" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Stack gap="md" align="center">
              <ThemeIcon size={60} radius="xl" color="green" style={{ animation: 'pulse 2s ease-in-out' }}>
                <IconCheck size={30} />
              </ThemeIcon>
              
              <Title order={3} ta="center" style={{ animation: 'slideDown 0.5s ease-out 0.2s both' }}>Resume Processed!</Title>
              
              <Text ta="center" maw={400} style={{ animation: 'fadeIn 0.5s ease-out 0.3s both' }}>
                We've successfully extracted and analyzed your resume.
              </Text>
              
              {extractedData && (
                <Paper withBorder p="md" radius="md" shadow="sm" w="100%" className="modern-card" style={{ animation: 'slideUp 0.5s ease-out 0.4s both' }}>
                  <Stack gap="md">
                    {extractedData.contactInfo.name && (
                      <Group>
                        <ThemeIcon size={36} radius="md" color="blue" variant="light">
                          <IconUser size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" color="dimmed">Name</Text>
                          <Text>{extractedData.contactInfo.name}</Text>
                        </div>
                      </Group>
                    )}
                    
                    {extractedData.contactInfo.email && (
                      <Group>
                        <ThemeIcon size={36} radius="md" color="blue" variant="light">
                          <IconMail size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" color="dimmed">Email</Text>
                          <Text>{extractedData.contactInfo.email}</Text>
                        </div>
                      </Group>
                    )}
                    
                    {extractedData.contactInfo.phone && (
                      <Group>
                        <ThemeIcon size={36} radius="md" color="blue" variant="light">
                          <IconPhone size={20} />
                        </ThemeIcon>
                        <div>
                          <Text size="xs" color="dimmed">Phone</Text>
                          <Text>{extractedData.contactInfo.phone}</Text>
                        </div>
                      </Group>
                    )}
                    
                    {extractedData.skills.length > 0 && (
                      <div>
                        <Text size="xs" color="dimmed" mb="xs">Detected Skills</Text>
                        <Group gap="xs" style={{ rowGap: '8px' }}>
                          {extractedData.skills.slice(0, 10).map((skill, index) => (
                            <Badge 
                              key={index} 
                              color="blue" 
                              variant="light"
                              style={{ 
                                animation: `fadeIn 0.3s ease-out ${0.1 * (index % 5)}s both`,
                                opacity: 0
                              }}
                            >
                              {skill}
                            </Badge>
                          ))}
                          {extractedData.skills.length > 10 && (
                            <Badge color="gray">+{extractedData.skills.length - 10} more</Badge>
                          )}
                        </Group>
                      </div>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

// Helper component for processing stage visualization
function ProcessingStageItem({ icon, label, isActive, isCompleted }: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  isCompleted: boolean; 
}) {
  return (
    <Group justify="space-between">
      <Group>
        <ThemeIcon 
          size={28} 
          radius="xl" 
          color={isCompleted ? 'green' : isActive ? 'blue' : 'gray'} 
          variant={isCompleted ? 'filled' : 'light'}
          style={{
            transition: 'all 0.2s ease',
            ...(isActive && {
              animation: 'pulse 2s infinite'
            })
          }}
        >
          {isCompleted ? <IconCheck size={16} /> : icon}
        </ThemeIcon>
        <Text 
          size="sm" 
          fw={isActive || isCompleted ? 500 : 400}
          color={isCompleted ? 'green' : isActive ? 'blue' : 'dimmed'}
        >
          {label}
        </Text>
      </Group>
      {isCompleted && <IconCheck size={16} color="green" style={{ animation: 'fadeIn 0.3s ease-out' }} />}
    </Group>
  );
} 