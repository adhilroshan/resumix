import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
  Group, 
  Avatar, 
  Divider, 
  Grid, 
  Box, 
  Paper,
  Badge,
  ThemeIcon,
  TextInput,
  Select,
  Textarea
} from '@mantine/core';
import { 
  IconEdit, 
  IconFileUpload, 
  IconMail, 
  IconPhone, 
  IconMapPin,
  IconSchool,
  IconCalendar,
  IconDeviceLaptop,
  IconFileText,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { StorageService } from '../../services/storageService';
import { ResponsiveContainer, useResponsiveSizes } from '../../components/ResponsiveContainer';
import { ResumeUploader } from '../../components/ResumeUploader';
import type { UserInformation } from '../../services/storageService';

// Profile Edit Form Component
function ProfileEditForm({ 
  userInfo, 
  onSave, 
  onCancel 
}: { 
  userInfo: UserInformation | null,
  onSave: (data: UserInformation) => void,
  onCancel: () => void
}) {
  // Initialize form with current user data or empty values
  const [formData, setFormData] = useState<UserInformation>({
    fullName: userInfo?.fullName || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    location: userInfo?.location || '',
    jobTitle: userInfo?.jobTitle || '',
    yearsOfExperience: userInfo?.yearsOfExperience || '',
    educationLevel: userInfo?.educationLevel || '',
    bio: userInfo?.bio || ''
  });

  // Handle form field changes
  const handleChange = (field: keyof UserInformation, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    onSave(formData);
  };

  const responsiveSizes = useResponsiveSizes();
  const isSmall = responsiveSizes.isSmall;

  return (
    <Paper p={isSmall ? "sm" : "md"} radius="md" withBorder shadow="sm">
      <Stack gap={isSmall ? "xs" : "md"}>
        <Group justify="space-between">
          <Text fw={500} size={isSmall ? "md" : "lg"}>Edit Profile</Text>
          <Group gap="xs">
            <Button 
              size={isSmall ? "xs" : "sm"} 
              variant="default" 
              onClick={onCancel}
              leftSection={<IconX size={isSmall ? 12 : 14} />}
            >
              Cancel
            </Button>
            <Button 
              size={isSmall ? "xs" : "sm"} 
              onClick={handleSubmit}
              leftSection={<IconCheck size={isSmall ? 12 : 14} />}
            >
              Save
            </Button>
          </Group>
        </Group>

        <Divider />

        <Grid gutter={isSmall ? "xs" : "md"}>
          <Grid.Col span={isSmall ? 12 : 6}>
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              size={isSmall ? "xs" : "sm"}
              required
            />
          </Grid.Col>
          <Grid.Col span={isSmall ? 12 : 6}>
            <TextInput
              label="Email"
              placeholder="john.doe@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              size={isSmall ? "xs" : "sm"}
              required
            />
          </Grid.Col>
          <Grid.Col span={isSmall ? 12 : 6}>
            <TextInput
              label="Phone Number"
              placeholder="(123) 456-7890"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              size={isSmall ? "xs" : "sm"}
            />
          </Grid.Col>
          <Grid.Col span={isSmall ? 12 : 6}>
            <TextInput
              label="Location"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              size={isSmall ? "xs" : "sm"}
            />
          </Grid.Col>
          <Grid.Col span={isSmall ? 12 : 6}>
            <TextInput
              label="Current/Desired Job Title"
              placeholder="Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              size={isSmall ? "xs" : "sm"}
              required
            />
          </Grid.Col>
          <Grid.Col span={isSmall ? 12 : 6}>
            <Select
              label="Years of Experience"
              placeholder="Select years of experience"
              data={[
                { value: '0-1', label: '0-1 years' },
                { value: '1-3', label: '1-3 years' },
                { value: '3-5', label: '3-5 years' },
                { value: '5-7', label: '5-7 years' },
                { value: '7-10', label: '7-10 years' },
                { value: '10+', label: '10+ years' },
              ]}
              value={formData.yearsOfExperience}
              onChange={(value) => handleChange('yearsOfExperience', value || '')}
              size={isSmall ? "xs" : "sm"}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Select
              label="Education Level"
              placeholder="Select your highest education level"
              data={[
                { value: 'high-school', label: 'High School' },
                { value: 'associate', label: 'Associate Degree' },
                { value: 'bachelor', label: 'Bachelor\'s Degree' },
                { value: 'master', label: 'Master\'s Degree' },
                { value: 'phd', label: 'PhD' },
              ]}
              value={formData.educationLevel}
              onChange={(value) => handleChange('educationLevel', value || '')}
              size={isSmall ? "xs" : "sm"}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Professional Summary"
              placeholder="Write a brief professional summary..."
              minRows={3}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              size={isSmall ? "xs" : "sm"}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}

// Skills Edit Form Component
function SkillsEditForm({ 
  skills, 
  onSave, 
  onCancel 
}: { 
  skills: string[],
  onSave: (skills: string[]) => void,
  onCancel: () => void
}) {
  const [skillsList, setSkillsList] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState('');
  const responsiveSizes = useResponsiveSizes();
  const isSmall = responsiveSizes.isSmall;

  // Handle adding a new skill
  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Prevent duplicate skills (case-insensitive)
    if (!skillsList.some(skill => skill.toLowerCase() === newSkill.toLowerCase())) {
      setSkillsList([...skillsList, newSkill.trim()]);
    }
    
    setNewSkill('');
  };

  // Handle removing a skill
  const removeSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
  };

  // Handle Enter key press to add skill
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    onSave(skillsList);
  };

  return (
    <Paper p={isSmall ? "sm" : "md"} radius="md" withBorder shadow="sm">
      <Stack gap={isSmall ? "xs" : "md"}>
        <Group justify="space-between">
          <Text fw={500} size={isSmall ? "md" : "lg"}>Edit Skills</Text>
          <Group gap="xs">
            <Button 
              size={isSmall ? "xs" : "sm"} 
              variant="default" 
              onClick={onCancel}
              leftSection={<IconX size={isSmall ? 12 : 14} />}
            >
              Cancel
            </Button>
            <Button 
              size={isSmall ? "xs" : "sm"} 
              onClick={handleSubmit}
              leftSection={<IconCheck size={isSmall ? 12 : 14} />}
            >
              Save
            </Button>
          </Group>
        </Group>

        <Divider />

        <Group gap="xs">
          <TextInput
            placeholder="Add a skill (e.g., TypeScript, React, Project Management)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flexGrow: 1 }}
            size={isSmall ? "xs" : "sm"}
          />
          <Button 
            onClick={addSkill} 
            disabled={!newSkill.trim()}
            size={isSmall ? "xs" : "sm"}
          >
            Add
          </Button>
        </Group>

        {skillsList.length > 0 ? (
          <Box mt="xs">
            {skillsList.map((skill, index) => (
              <Badge
                key={index}
                size={isSmall ? "sm" : "md"}
                mr="xs"
                mb="xs"
                variant="outline"
                color="blue"
                rightSection={
                  <Box
                    onClick={() => removeSkill(skill)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      marginLeft: 5,
                      marginRight: -5,
                      fontSize: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </Box>
                }
              >
                {skill}
              </Badge>
            ))}
          </Box>
        ) : (
          <Text c="dimmed" size="sm" mt="md">
            No skills added yet. Add your skills to improve job matching.
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const [userInfo, setUserInfo] = useState(StorageService.getUserInformation());
  const [skills, setSkills] = useState(StorageService.getUserSkills());
  const [resumeData, setResumeData] = useState(StorageService.getResumeData());
  const [showResumeUploader, setShowResumeUploader] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const responsiveSizes = useResponsiveSizes();
  const isSmall = responsiveSizes.isSmall;

  useEffect(() => {
    // Refresh the data on component mount
    setUserInfo(StorageService.getUserInformation());
    setSkills(StorageService.getUserSkills());
    setResumeData(StorageService.getResumeData());
  }, []);

  const handleResumeUpdate = (text: string, fileName: string) => {
    setIsUpdating(true);
    
    try {
      if (text) {
        // Handle text update for text/LaTeX files
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const sourceType = fileExtension === 'tex' ? 'latex' : 'text';
        
        StorageService.saveResumeData({
          resumeText: text,
          fileName,
          uploadDate: new Date().toISOString(),
          sourceType: sourceType as 'pdf' | 'text' | 'latex'
        });
        
        // Refresh resume data
        setResumeData(StorageService.getResumeData());
        setShowResumeUploader(false);
      } else {
        // For PDF files (processing happens elsewhere)
        // We'll just handle the UI feedback
        console.log('PDF file selected, no text content available yet');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle saving edited profile information
  const handleSaveProfile = (data: UserInformation) => {
    // Save to storage
    StorageService.saveUserInformation(data);
    
    // Update state
    setUserInfo(data);
    
    // Exit edit mode
    setIsEditing(false);
  };

  // Handle saving skills
  const handleSaveSkills = (updatedSkills: string[]) => {
    // Save to storage
    StorageService.saveUserSkills(updatedSkills);
    
    // Update state
    setSkills(updatedSkills);
    
    // Exit edit mode
    setIsEditingSkills(false);
  };

  // Get user initials for avatar
  const userInitials = userInfo?.fullName 
    ? userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'U';

  return (
    <ResponsiveContainer py={isSmall ? "sm" : "xl"} px={isSmall ? "xs" : "md"}>
      <Stack gap={isSmall ? "sm" : responsiveSizes.padding.md}>
        <Group justify="space-between" align="center" mb={isSmall ? "xs" : responsiveSizes.padding.sm}>
          <Title order={isSmall ? 3 : 2}>Profile</Title>
        </Group>

        <Grid gutter={isSmall ? "xs" : "md"}>
          {/* Left column - User info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            {isEditing ? (
              <ProfileEditForm 
                userInfo={userInfo} 
                onSave={handleSaveProfile} 
                onCancel={() => setIsEditing(false)} 
              />
            ) : (
              <Paper p={isSmall ? "sm" : "md"} radius="md" withBorder shadow="sm">
                <Stack align="center" gap={isSmall ? "xs" : "md"}>
                  <Avatar 
                    size={isSmall ? 80 : 120} 
                    radius="xl" 
                    color="blue"
                    mt={isSmall ? "xs" : "md"}
                  >
                    {userInitials}
                  </Avatar>
                  
                  <Box ta="center">
                    <Title order={isSmall ? 4 : 3}>{userInfo?.fullName || 'User'}</Title>
                    <Text size={isSmall ? "sm" : "md"} c="dimmed">{userInfo?.jobTitle || 'Job Seeker'}</Text>
                  </Box>
                  
                  <Button 
                    variant="light" 
                    leftSection={<IconEdit size={16} />}
                    onClick={() => setIsEditing(true)}
                    size={isSmall ? "sm" : "md"}
                    radius="md"
                    mt={isSmall ? "xs" : 0}
                  >
                    Edit Profile
                  </Button>
                </Stack>
                
                <Divider my={isSmall ? "sm" : "md"} />
                
                <Stack gap={isSmall ? "xs" : "sm"}>
                  {userInfo?.email && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" size={isSmall ? "sm" : "md"} color="blue">
                        <IconMail size={isSmall ? 14 : 18} />
                      </ThemeIcon>
                      <Text size={isSmall ? "sm" : "md"}>{userInfo.email}</Text>
                    </Group>
                  )}
                  
                  {userInfo?.phone && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" size={isSmall ? "sm" : "md"} color="blue">
                        <IconPhone size={isSmall ? 14 : 18} />
                      </ThemeIcon>
                      <Text size={isSmall ? "sm" : "md"}>{userInfo.phone}</Text>
                    </Group>
                  )}
                  
                  {userInfo?.location && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" size={isSmall ? "sm" : "md"} color="blue">
                        <IconMapPin size={isSmall ? 14 : 18} />
                      </ThemeIcon>
                      <Text size={isSmall ? "sm" : "md"}>{userInfo.location}</Text>
                    </Group>
                  )}
                  
                  {userInfo?.yearsOfExperience && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" size={isSmall ? "sm" : "md"} color="blue">
                        <IconCalendar size={isSmall ? 14 : 18} />
                      </ThemeIcon>
                      <Text size={isSmall ? "sm" : "md"}>{userInfo.yearsOfExperience} years experience</Text>
                    </Group>
                  )}
                  
                  {userInfo?.educationLevel && (
                    <Group gap="xs">
                      <ThemeIcon variant="light" size={isSmall ? "sm" : "md"} color="blue">
                        <IconSchool size={isSmall ? 14 : 18} />
                      </ThemeIcon>
                      <Text size={isSmall ? "sm" : "md"}>{userInfo.educationLevel}</Text>
                    </Group>
                  )}

                  {userInfo?.bio && (
                    <Box mt={isSmall ? "xs" : "sm"}>
                      <Text fw={500} size={isSmall ? "sm" : "md"} mb={isSmall ? 5 : 8}>Professional Summary</Text>
                      <Text size={isSmall ? "xs" : "sm"} c="dimmed">{userInfo.bio}</Text>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}
          </Grid.Col>
          
          {/* Right column - Resume and Skills */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={isSmall ? "sm" : "md"}>
              {/* Resume Card */}
              <Paper p={isSmall ? "sm" : "md"} radius="md" withBorder shadow="sm">
                <Group justify="space-between" mb={isSmall ? "xs" : "sm"}>
                  <Group gap="xs">
                    <IconFileText size={isSmall ? 20 : 24} />
                    <Title order={isSmall ? 5 : 4}>Resume</Title>
                  </Group>
                  <Button 
                    size={isSmall ? "xs" : "sm"} 
                    variant="light"
                    leftSection={<IconFileUpload size={isSmall ? 14 : 16} />}
                    onClick={() => setShowResumeUploader(true)}
                  >
                    Update Resume
                  </Button>
                </Group>
                
                {showResumeUploader ? (
                  <ResumeUploader onResumeText={handleResumeUpdate} isLoading={isUpdating} />
                ) : (
                  <Card withBorder radius="md" p={isSmall ? "xs" : "sm"} bg="gray.0">
                    {resumeData ? (
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={500} size={isSmall ? "sm" : "md"}>{resumeData.fileName}</Text>
                          <Badge size={isSmall ? "xs" : "sm"}>
                            {resumeData.sourceType || 'pdf'}
                          </Badge>
                        </Group>
                        <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                          Last updated: {new Date(resumeData.uploadDate).toLocaleDateString()}
                        </Text>
                        <Button 
                          variant="subtle" 
                          size={isSmall ? "xs" : "sm"}
                          onClick={() => setShowResumeUploader(true)}
                        >
                          Replace
                        </Button>
                      </Stack>
                    ) : (
                      <Text ta="center" c="dimmed" py="md">
                        No resume uploaded yet
                      </Text>
                    )}
                  </Card>
                )}
              </Paper>
              
              {/* Skills Card */}
              <Paper p={isSmall ? "sm" : "md"} radius="md" withBorder shadow="sm">
                <Group justify="space-between" mb={isSmall ? "xs" : "sm"}>
                  <Group gap="xs">
                    <IconDeviceLaptop size={isSmall ? 20 : 24} />
                    <Title order={isSmall ? 5 : 4}>Skills</Title>
                  </Group>
                  <Button 
                    size={isSmall ? "xs" : "sm"} 
                    variant="light"
                    leftSection={<IconEdit size={isSmall ? 14 : 16} />}
                    onClick={() => setIsEditingSkills(true)}
                  >
                    Edit Skills
                  </Button>
                </Group>
                
                {isEditingSkills ? (
                  <SkillsEditForm
                    skills={skills}
                    onSave={handleSaveSkills}
                    onCancel={() => setIsEditingSkills(false)}
                  />
                ) : skills && skills.length > 0 ? (
                  <Box>
                    {skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        size={isSmall ? "sm" : "md"} 
                        variant="light" 
                        color="blue"
                        mr="xs" 
                        mb="xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </Box>
                ) : (
                  <Text ta="center" c="dimmed" py="md">
                    No skills added yet
                  </Text>
                )}
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </ResponsiveContainer>
  );
} 