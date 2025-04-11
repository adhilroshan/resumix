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
  Grid,
  List,
  ThemeIcon
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
  IconPhone
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
        if (progressValue < 30) {
          setProcessingStage('Initializing PDF processor...');
        } else if (progressValue < 60) {
          setProcessingStage('Extracting text from pages...');
        } else if (progressValue < 90) {
          setProcessingStage('Finalizing extraction...');
        } else {
          setProcessingStage('Analyzing content...');
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
    <Paper p={isSmall ? "sm" : "md"} withBorder radius="md">
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
              styles={isSmall ? {
                root: { borderWidth: '1px' }
              } : undefined}
            >
              <Group justify="center" gap={isSmall ? "sm" : "xl"} style={{ minHeight: rem(isSmall ? 100 : 120), pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={isSmall ? 22 : 28} stroke={1.5} />
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
                      <IconUpload size={isSmall ? 22 : 28} stroke={1.5} />
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
                >
                  Process PDF
                </Button>
              </Group>
            )}
          </>
        ) : isProcessing ? (
          <Box my={isSmall ? "xs" : "md"}>
            <Text ta="center" fw={500} size={isSmall ? "sm" : "md"} mb={isSmall ? "xs" : "md"}>
              {processingStage}
            </Text>
            
            <Center mb={isSmall ? "xs" : "md"}>
              <RingProgress
                size={isSmall ? 100 : 120}
                thickness={isSmall ? 8 : 12}
                roundCaps
                sections={[{ value: progress, color: 'blue' }]}
                label={
                  <Center>
                    <Text fw={700} size={isSmall ? "md" : "xl"}>{progress}%</Text>
                  </Center>
                }
              />
            </Center>
            
            <Text ta="center" size={isSmall ? "xs" : "sm"} c="dimmed">
              Extracting text, analyzing skills, and preparing your profile...
            </Text>
          </Box>
        ) : success && showVerification ? (
          <Box>
            <Alert 
              color="green" 
              title="Resume Successfully Processed" 
              icon={<IconCheck size={isSmall ? 14 : 16} stroke={1.5} />} 
              mb={isSmall ? "xs" : "md"}
            >
              <Text size={isSmall ? "xs" : "sm"}>
                Your resume has been processed and your profile has been updated.
              </Text>
            </Alert>
            
            {extractedData && (
              <Grid>
                {extractedData.contactInfo && (extractedData.contactInfo.name || extractedData.contactInfo.email || extractedData.contactInfo.phone) && (
                  <Grid.Col span={12}>
                    <Box mb={isSmall ? "xs" : "sm"}>
                      <Text fw={500} size={isSmall ? "sm" : "md"} mb={isSmall ? "xs" : "sm"}>
                        Extracted Contact Information
                      </Text>
                      <List size={isSmall ? "xs" : "sm"}>
                        {extractedData.contactInfo.name && (
                          <List.Item
                            icon={
                              <ThemeIcon color="blue" variant="light" size={isSmall ? 16 : 18}>
                                <IconUser size={isSmall ? 10 : 12} stroke={1.5} />
                              </ThemeIcon>
                            }
                          >
                            {extractedData.contactInfo.name}
                          </List.Item>
                        )}
                        {extractedData.contactInfo.email && (
                          <List.Item
                            icon={
                              <ThemeIcon color="blue" variant="light" size={isSmall ? 16 : 18}>
                                <IconMail size={isSmall ? 10 : 12} stroke={1.5} />
                              </ThemeIcon>
                            }
                          >
                            {extractedData.contactInfo.email}
                          </List.Item>
                        )}
                        {extractedData.contactInfo.phone && (
                          <List.Item
                            icon={
                              <ThemeIcon color="blue" variant="light" size={isSmall ? 16 : 18}>
                                <IconPhone size={isSmall ? 10 : 12} stroke={1.5} />
                              </ThemeIcon>
                            }
                          >
                            {extractedData.contactInfo.phone}
                          </List.Item>
                        )}
                      </List>
                    </Box>
                  </Grid.Col>
                )}
                
                {extractedData.skills && extractedData.skills.length > 0 && (
                  <Grid.Col span={12}>
                    <Box>
                      <Text fw={500} size={isSmall ? "sm" : "md"} mb={isSmall ? "xs" : "sm"}>
                        Detected Skills ({extractedData.skills.length})
                      </Text>
                      <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                        {extractedData.skills.slice(0, 10).map((skill, index) => (
                          <Alert key={index} color="blue" p={isSmall ? "xs" : "sm"} radius="sm" variant="light" style={{ margin: '4px' }}>
                            {skill}
                          </Alert>
                        ))}
                        {extractedData.skills.length > 10 && (
                          <Text size="xs" c="dimmed">
                            ...and {extractedData.skills.length - 10} more
                          </Text>
                        )}
                      </Group>
                    </Box>
                  </Grid.Col>
                )}
              </Grid>
            )}
            
            <Group justify="center" mt={isSmall ? "sm" : "md"}>
              <Button
                onClick={() => {
                  setFile(null);
                  setSuccess(false);
                  setExtractedData(null);
                }}
                size={isSmall ? "sm" : "md"}
                variant="light"
              >
                Upload Another Resume
              </Button>
            </Group>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
} 