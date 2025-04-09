import { useState, useRef } from 'react';
import { Text, Button, Paper, Box, Stack, Alert, Center, RingProgress, useMantineTheme } from '@mantine/core';
import { IconCloudUpload, IconFileUpload, IconCheck, IconX } from '@tabler/icons-react';
import { extractTextFromPDF, extractPotentialSkills, extractContactInfo } from '../../utils/pdfUtils';
import { StorageService } from '../../services/storageService';
import type { UserInformation } from '../../services/storageService';

interface ResumeUploadProps {
  onResumeProcessed: (text: string) => void;
}

export function ResumeUpload({ onResumeProcessed }: ResumeUploadProps) {
  const theme = useMantineTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    handleFileSelection(selectedFile);
  };

  const handleFileSelection = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else if (selectedFile) {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);
    
    try {
      // Extract text from PDF using our utility function
      const text = await extractTextFromPDF(file, setProgress);
      
      // Save to storage service
      StorageService.saveResumeData(text, file.name);
      
      // Extract potential skills and contact info
      const potentialSkills = extractPotentialSkills(text);
      const contactInfo = extractContactInfo(text);
      
      // Store potential skills for later use
      if (potentialSkills.length > 0) {
        localStorage.setItem('detectedSkills', JSON.stringify(potentialSkills));
      }
      
      // If we found contact info, pre-fill the user information
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
      
      // Set success and call callback
      setSuccess(true);
      onResumeProcessed(text);
    } catch (err) {
      setError('Error processing PDF. Please try another file.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper p="xs md" withBorder className="resume-upload-paper">
      <Stack gap="sm md">
        <Text size="lg" fw={500} ta="center">Upload your resume</Text>
        
        {!isProcessing ? (
          <>
            <Box
              className={`upload-box ${isDragging ? 'dragging' : ''}`}
              style={{
                border: isDragging ? `2px solid ${theme.colors.blue[6]}` : '2px dashed #ced4da',
                borderRadius: '8px',
                padding: '20px 15px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isDragging ? '#e9f5ff' : 'transparent',
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="application/pdf"
              />
              
              {file ? (
                <>
                  <Center style={{ marginBottom: '12px' }}>
                    <IconFileUpload size={40} color={theme.colors.blue[6]} stroke={1.5} />
                  </Center>
                  <Text fw={500} size="md">
                    {file.name}
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </>
              ) : (
                <>
                  <Center style={{ marginBottom: '12px' }}>
                    <IconCloudUpload 
                      size={40}
                      color="#868e96" 
                      stroke={1.5} 
                      className="cloud-icon"
                    />
                  </Center>
                  <Text size="md" fw={500} mb="xs">
                    Upload your PDF resume
                  </Text>
                  <Text size="sm" c="dimmed" mb="xs">
                    Tap here to select a file
                  </Text>
                  <Text size="xs" c="dimmed">
                    PDF files only, max 10MB
                  </Text>
                </>
              )}
            </Box>

            {error && (
              <Alert color="red" title="Error" icon={<IconX size={16} />} radius="md">
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" title="Success" icon={<IconCheck size={16} />} radius="md">
                Resume successfully processed! Proceed to the next step.
              </Alert>
            )}

            <Button
              size="md"
              radius="md"
              fullWidth
              onClick={handleUpload}
              disabled={!file || isProcessing}
              leftSection={<IconFileUpload size={20} />}
              className="upload-button"
              style={{ marginTop: '10px', minHeight: '50px' }}
            >
              {file ? 'Process Resume' : 'Select a PDF File'}
            </Button>
          </>
        ) : (
          <Box my="xl" className="processing-container">
            <Text ta="center" fw={500} size="lg" mb="md">
              Processing your resume...
            </Text>
            
            <Center mb="md">
              <RingProgress
                size={120}
                thickness={12}
                roundCaps
                sections={[{ value: progress, color: 'blue' }]}
                label={
                  <Center>
                    <Text fw={700} size="xl">{progress}%</Text>
                  </Center>
                }
                className="ring-progress"
              />
            </Center>
            
            <Text ta="center" size="sm" c="dimmed">
              Extracting text, analyzing skills, and preparing your profile...
            </Text>
          </Box>
        )}
      </Stack>
    </Paper>
  );
} 