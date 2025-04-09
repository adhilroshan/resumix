import { useState, useRef } from 'react';
import { Text, Group, Button, Paper, Box, Progress, Stack, Alert, Center } from '@mantine/core';
import { extractTextFromPDF, extractPotentialSkills, extractContactInfo } from '../../utils/pdfUtils';
import { StorageService } from '../../services/storageService';
import type { UserInformation } from '../../services/storageService';

interface ResumeUploadProps {
  onResumeProcessed: (text: string) => void;
}

export function ResumeUpload({ onResumeProcessed }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } else if (selectedFile) {
      setError('Please upload a PDF file');
      setFile(null);
    }
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
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>Upload your resume</Text>
        
        {!isProcessing ? (
          <>
            <Box
              style={{
                border: '2px dashed #ced4da',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="application/pdf"
              />
              <Text>
                {file ? file.name : 'Click to select or drop your PDF resume'}
              </Text>
            </Box>

            {error && (
              <Alert color="red" title="Error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" title="Success">
                Resume successfully processed! Proceed to the next step.
              </Alert>
            )}

            <Group justify="flex-end">
              <Button
                onClick={handleUpload}
                disabled={!file || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Upload and Process'}
              </Button>
            </Group>
          </>
        ) : (
          <Box>
            <Text ta="center" mb="sm">
              Processing your resume...
            </Text>
            <Center mb="xs">
              <Text fw={500}>{progress}%</Text>
            </Center>
            <Progress
              value={progress}
              size="lg"
              striped
              animated
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
} 