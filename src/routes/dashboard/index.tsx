import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
  Group, 
  Textarea,
  Progress,
  ThemeIcon, 
  Box, 
  Paper, 
  Modal,
  Notification, 
  Grid,
  Tabs,
  Avatar,
  Badge,
  RingProgress,
} from '@mantine/core'
import { 
  IconHistory, 
  IconBell, 
  IconRocket, 
  IconFileDescription, 
  IconKey,
  IconUpload,
  IconReportAnalytics,
  IconFileText,
 
  IconCalendar,
  IconInfoCircle,
  IconChevronRight,
  IconArrowRight,
  IconChartBar,
  IconCheck,

  IconExternalLink
} from '@tabler/icons-react'
import { StorageService } from '../../services/storageService'
import { analyzeResumeMatch } from '../../services/openRouterService'
import { ApiKeyManager } from '../../components/ApiKeyManager'
import { createLazyRouteComponent } from '../../utils/routeUtils'
import { ResponsiveContainer, useResponsiveSizes } from '../../components/ResponsiveContainer'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ResumeUploader } from '../../components/ResumeUploader'

// Main component implementation
function DashboardPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const navigate = useNavigate()
  const [showNotificationTip, setShowNotificationTip] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<string>('default')
  const responsiveSizes = useResponsiveSizes()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>('jobdesc')
  const isSmall = responsiveSizes.isSmall

  // Get user information and resume data for dashboard display
  const userInfo = StorageService.getUserInformation();
  const resumeData = StorageService.getResumeData();
  const userSkills = StorageService.getUserSkills();
  const analysisHistory = StorageService.getAnalysisHistory();
  const lastAnalysis = StorageService.getLastAnalysisResult();
  
  // Get user initials for avatar
  const userInitials = userInfo?.fullName 
    ? userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'U';

  // Check notification permission status and update once on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      setShowNotificationTip(Notification.permission !== 'granted');
    }

    // Simulate page content loading
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return

    try {
      setIsSubmitting(true)
      setLoadingProgress(10)

      // Get resume data from storage
      const resume = StorageService.getResumeData()
      const userInfo = StorageService.getUserInformation()
      const skills = StorageService.getUserSkills()

      if (!resume || !userInfo || !skills.length) {
        alert('Please complete your profile setup first')
        navigate({ to: '/setup' })
        return
      }

      setLoadingProgress(30)

      // Prepare resume data for analysis
      const resumeData = {
        resumeText: resume.resumeText,
        userInfo: {
          fullName: userInfo.fullName,
          jobTitle: userInfo.jobTitle,
          yearsOfExperience: userInfo.yearsOfExperience,
          educationLevel: userInfo.educationLevel,
          bio: userInfo.bio
        },
        skills
      }

      setLoadingProgress(50)

      // Call the API service
      const result = await analyzeResumeMatch(resumeData, jobDescription)

      setLoadingProgress(90)

      // Save results - add jobDescription to match expected type
      StorageService.saveAnalysisResult({
        ...result,
        jobDescription
      }, jobDescription)

      setLoadingProgress(100)

      // Show notification if permission is granted
      showAnalysisCompleteNotification(result.overallMatch);

      // Navigate to results page
      navigate({ to: '/analysis' })
    } catch (error) {
      console.error('Error analyzing resume:', error)
      alert('Failed to analyze resume. Please check your API key or try again later.')
    } finally {
      setIsSubmitting(false)
      setLoadingProgress(0)
    }
  }

  const handleViewHistory = () => {
    navigate({ to: '/history' })
  }
  
  const dismissNotification = () => {
    setShowNotificationTip(false);
  }

  // Enable notifications button click handler
  const handleEnableNotifications = useCallback(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    // Request permission
    const requestPermission = async () => {
      try {
        const permission = await window.Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          setShowNotificationTip(false);
          
          // Show a test notification
          try {
            const notification = new window.Notification('Notifications Enabled', {
              body: 'You will be notified when your resume analysis is complete',
              icon: '/favicon.ico'
            });
            
            // Auto close after 3 seconds
            setTimeout(() => notification.close(), 3000);
          } catch (e) {
            console.error('Failed to show notification', e);
          }
        }
      } catch (error) {
        console.error('Failed to request notification permission', error);
        alert('Failed to request notification permission');
      }
    };
    
    requestPermission();
  }, []);

  // Function to show a notification when analysis is complete
  const showAnalysisCompleteNotification = useCallback((score: number) => {
    if (notificationPermission !== 'granted' || !window.Notification) return;
    
    try {
      const notification = new window.Notification(`Resume Analysis Complete: ${Math.round(score)}% Match`, {
        body: 'Your resume has been analyzed. Click to view details.',
        icon: '/favicon.ico'
      });
      
      notification.onclick = () => {
        window.focus();
        navigate({ to: '/analysis' });
        notification.close();
      };
      
      // Auto close after 10 seconds if not clicked
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [navigate, notificationPermission]);

  // Handle resume text from direct file uploads (text/LaTeX)
  const handleResumeText = (text: string, fileName: string) => {
    if (text) {
      // If text is provided (for text/latex files), save it directly
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const sourceType = fileExtension === 'tex' ? 'latex' : 'text';
      
      StorageService.saveResumeData({
        resumeText: text,
        fileName,
        uploadDate: new Date().toISOString(),
        sourceType: sourceType as 'text' | 'latex'
      });
      
      alert(`Resume content saved from ${sourceType} file!`);
    } else {
      // For PDF files, the PDF extraction will happen elsewhere
      // We'll just handle the UI feedback
      setActiveTab('jobdesc');
    }
  };

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "teal";
    if (score >= 40) return "yellow";
    return "red";
  };

  const isProfileComplete = userInfo && resumeData && userSkills.length > 0;

  return (
    <ResponsiveContainer py={isSmall ? "sm" : "xl"} px={isSmall ? "xs" : "md"}>
      {isPageLoading ? (
        <LoadingScreen variant="inline" text="Loading dashboard..." />
      ) : (
        <Stack gap={isSmall ? "sm" : responsiveSizes.padding.md}>
          <Modal
            opened={apiKeyModalOpen}
            onClose={() => setApiKeyModalOpen(false)}
            title="Manage API Keys"
            size={isSmall ? "full" : "lg"}
            fullScreen={isSmall}
            padding={isSmall ? "xs" : "md"}
            zIndex={1000}
          >
            <ApiKeyManager onSave={() => setApiKeyModalOpen(false)} />
          </Modal>

          <Group 
            justify="space-between" 
            align="center" 
            mb={responsiveSizes.padding.sm}
            wrap={isSmall ? "wrap" : "nowrap"}
          >
            <Title order={isSmall ? 3 : 2} mb={isSmall ? "xs" : 0}>Resume Dashboard</Title>
            <Group gap={isSmall ? "xs" : "md"}>
              <Button
                leftSection={<IconHistory size={isSmall ? 14 : 16} />}
                variant="light"
                size={isSmall ? 'sm' : 'md'}
                onClick={handleViewHistory}
                styles={{
                  root: {
                    height: isSmall ? 36 : undefined,
                    minWidth: isSmall ? 80 : undefined,
                  }
                }}
              >
                History
              </Button>
              <Button 
                leftSection={<IconKey size={isSmall ? 14 : 16} />}
                variant="light" 
                size={isSmall ? 'sm' : 'md'}
                onClick={() => setApiKeyModalOpen(true)}
                styles={{
                  root: {
                    height: isSmall ? 36 : undefined,
                    minWidth: isSmall ? 80 : undefined,
                  }
                }}
              >
                API Key
              </Button>
            </Group>
          </Group>

          {/* Status Banner - Only shows if profile is incomplete */}
          {!isProfileComplete && (
            <Paper 
              withBorder 
              radius="md" 
              p={isSmall ? "sm" : "md"} 
              mb={isSmall ? "xs" : "sm"}
              bg="blue.0"
            >
              <Group wrap={isSmall ? "wrap" : "nowrap"} justify="space-between">
                <Group>
                  <ThemeIcon radius="xl" size={isSmall ? 36 : 48} color="blue">
                    <IconInfoCircle size={isSmall ? 18 : 24} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text fw={600} size={isSmall ? "sm" : "md"}>Complete your profile</Text>
                    <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                      Upload your resume, add skills, and complete your profile to get started
                    </Text>
                  </Stack>
                </Group>
                <Button 
                  variant="light" 
                  rightSection={<IconArrowRight size={isSmall ? 14 : 16} />}
                  onClick={() => navigate({ to: '/profile' })}
                  size={isSmall ? "sm" : "md"}
                  mt={isSmall ? "xs" : 0}
                >
                  Complete Profile
                </Button>
              </Group>
            </Paper>
          )}

          {/* Notification Permission Alert */}
          {showNotificationTip && (
            <Paper withBorder radius="md" p={isSmall ? "xs" : "sm"} mb={isSmall ? "xs" : "sm"} bg="blue.0">
              <Group justify="space-between" align="flex-start">
                <Group align="flex-start" wrap="nowrap" gap={isSmall ? "xs" : "sm"}>
                  <ThemeIcon 
                    size={isSmall ? 32 : 40} 
                    radius="xl" 
                    color="blue" 
                    variant="light"
                    mt={2}
                  >
                    <IconBell size={isSmall ? 16 : 20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size={isSmall ? "sm" : "md"} mb={4}>Enable Notifications</Text>
                    <Text size={isSmall ? "xs" : "sm"} c="dimmed" lineClamp={2}>
                      Get notified when your resume analysis is complete.
                    </Text>
                  </div>
                </Group>
                <Group gap="xs" mt={isSmall ? 10 : 0}>
                  <Button 
                    size={isSmall ? "xs" : "sm"} 
                    variant="light" 
                    onClick={dismissNotification}
                    px={isSmall ? 10 : undefined}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    size={isSmall ? "xs" : "sm"} 
                    onClick={handleEnableNotifications}
                    px={isSmall ? 10 : undefined}
                  >
                    Enable
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}

          {/* User Profile Card */}
          <Paper 
            withBorder 
            radius="md" 
            p={isSmall ? "sm" : "md"} 
            mb={isSmall ? "xs" : "sm"}
            shadow="sm"
            bg="white"
          >
            <Grid gutter={isSmall ? "xs" : "md"} align="center">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Group>
                  <Avatar 
                    radius="xl" 
                    size={isSmall ? 50 : 64} 
                    color="blue"
                    bg="blue.1"
                    c="blue.9"
                  >
                    {userInitials}
                  </Avatar>
                  <Box>
                    <Text fw={600} size={isSmall ? "md" : "lg"} lh={1.3}>
                      {userInfo?.fullName || 'Welcome'}
                    </Text>
                    <Text c="dimmed" size={isSmall ? "xs" : "sm"}>
                      {userInfo?.jobTitle || 'Job Seeker'}
                    </Text>
                  </Box>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 5 }}>
                <Group wrap="wrap" gap="xs">
                  {userSkills.slice(0, 5).map((skill, index) => (
                    <Badge 
                      key={index} 
                      size={isSmall ? "sm" : "md"} 
                      color="blue" 
                      variant="light"
                      radius="sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {userSkills.length > 5 && (
                    <Badge 
                      size={isSmall ? "sm" : "md"} 
                      color="blue" 
                      variant="outline"
                      radius="sm"
                    >
                      +{userSkills.length - 5} more
                    </Badge>
                  )}
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 12, md: 3 }} mt={isSmall ? "xs" : 0}>
                <Group justify="flex-end">
                  <Button
                    variant="outline"
                    color="blue"
                    size={isSmall ? "sm" : "md"}
                    rightSection={<IconChevronRight size={isSmall ? 14 : 16} />}
                    onClick={() => navigate({ to: '/profile' })}
                    fullWidth={isSmall}
                  >
                    Manage Profile
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>

          <Grid gutter={isSmall ? "xs" : "md"}>
            <Grid.Col span={{ base: 12, lg: 7 }}>
              {lastAnalysis && (
                <Paper 
                  withBorder 
                  radius="md" 
                  p={isSmall ? "sm" : "md"} 
                  mb={isSmall ? "sm" : "md"}
                  shadow="sm"
                >
                  <Grid gutter={isSmall ? "xs" : "md"} align="center">
                    <Grid.Col span={{ base: 12, sm: 8 }}>
                      <Group mb={isSmall ? 0 : "xs"}>
                        <ThemeIcon 
                          size={isSmall ? 36 : 42} 
                          radius="md" 
                          color="teal"
                        >
                          <IconChartBar size={isSmall ? 18 : 22} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={600} size={isSmall ? "md" : "lg"}>Latest Analysis</Text>
                          <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                            Analyzed on {new Date(lastAnalysis.timestamp).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }} style={{textAlign: isSmall ? 'left' : 'right'}}>
                      <Button 
                        size={isSmall ? "sm" : "md"}
                        variant="light"
                        rightSection={<IconExternalLink size={isSmall ? 14 : 16} />}
                        onClick={() => navigate({ to: '/analysis' })}
                      >
                        View Details
                      </Button>
                    </Grid.Col>
                  </Grid>
                  
                  <Grid mt={isSmall ? "xs" : "md"} gutter={isSmall ? "xs" : "md"}>
                    <Grid.Col span={{ base: 4 }}>
                      <Stack align="center" gap={isSmall ? 5 : 10}>
                        <RingProgress
                          size={isSmall ? 80 : 100}
                          thickness={isSmall ? 8 : 10}
                          roundCaps
                          sections={[{ value: lastAnalysis.overallMatch, color: getScoreColor(lastAnalysis.overallMatch) }]}
                          label={
                            <Text fw={700} ta="center" size={isSmall ? "lg" : "xl"}>
                              {Math.round(lastAnalysis.overallMatch)}%
                            </Text>
                          }
                        />
                        <Text fw={500} size={isSmall ? "xs" : "sm"} ta="center">Overall Match</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 4 }}>
                      <Stack align="center" gap={isSmall ? 5 : 10}>
                        <RingProgress
                          size={isSmall ? 80 : 100}
                          thickness={isSmall ? 8 : 10}
                          roundCaps
                          sections={[{ value: lastAnalysis.skillsMatch, color: getScoreColor(lastAnalysis.skillsMatch) }]}
                          label={
                            <Text fw={700} ta="center" size={isSmall ? "lg" : "xl"}>
                              {Math.round(lastAnalysis.skillsMatch)}%
                            </Text>
                          }
                        />
                        <Text fw={500} size={isSmall ? "xs" : "sm"} ta="center">Skills Match</Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 4 }}>
                      <Stack align="center" gap={isSmall ? 5 : 10}>
                        <RingProgress
                          size={isSmall ? 80 : 100}
                          thickness={isSmall ? 8 : 10}
                          roundCaps
                          sections={[{ value: lastAnalysis.experienceMatch, color: getScoreColor(lastAnalysis.experienceMatch) }]}
                          label={
                            <Text fw={700} ta="center" size={isSmall ? "lg" : "xl"}>
                              {Math.round(lastAnalysis.experienceMatch)}%
                            </Text>
                          }
                        />
                        <Text fw={500} size={isSmall ? "xs" : "sm"} ta="center">Experience Match</Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                  
                  {lastAnalysis.missingSkills && lastAnalysis.missingSkills.length > 0 && (
                    <Box mt={isSmall ? "xs" : "md"}>
                      <Text fw={600} size={isSmall ? "sm" : "md"} mb={isSmall ? 5 : 8}>
                        Missing Skills ({lastAnalysis.missingSkills.length})
                      </Text>
                      <Group gap="xs">
                        {lastAnalysis.missingSkills.slice(0, 5).map((skill, index) => (
                          <Badge 
                            key={index} 
                            color="red" 
                            variant="light" 
                            size={isSmall ? "sm" : "md"}
                          >
                            {skill}
                          </Badge>
                        ))}
                        {lastAnalysis.missingSkills.length > 5 && (
                          <Badge variant="outline" size={isSmall ? "sm" : "md"}>
                            +{lastAnalysis.missingSkills.length - 5} more
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  )}
                </Paper>
              )}

              <Tabs 
                value={activeTab} 
                onChange={setActiveTab}
                radius="md"
                styles={{
                  tab: {
                    padding: isSmall ? '0.5rem 0.75rem' : undefined,
                    fontSize: isSmall ? '0.875rem' : undefined,
                    height: isSmall ? '2.5rem' : undefined
                  },
                  panel: {
                    paddingTop: isSmall ? '0.75rem' : undefined
                  }
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="jobdesc" leftSection={<IconFileDescription size={isSmall ? 14 : 16} />}>
                    Job Description
                  </Tabs.Tab>
                  <Tabs.Tab value="resume" leftSection={<IconUpload size={isSmall ? 14 : 16} />}>
                    Resume Upload
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="jobdesc" pt={isSmall ? "xs" : "md"}>
                  <Card withBorder p={isSmall ? "sm" : responsiveSizes.padding.md} radius="md" shadow="sm">
                    <Stack gap={isSmall ? "xs" : responsiveSizes.padding.md}>
                      <Group>
                        <ThemeIcon size={isSmall ? "lg" : "xl"} radius="md" color="blue">
                          <IconFileDescription size={isSmall ? 20 : 24} />
                        </ThemeIcon>
                        <Box>
                          <Title order={isSmall ? 5 : 4}>Job Description</Title>
                          <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                            Paste a job description to analyze your resume match
                          </Text>
                        </Box>
                      </Group>
                
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description here..."
                        autosize
                        minRows={isSmall ? 6 : 8}
                        maxRows={isSmall ? 10 : 12}
                        styles={{
                          input: {
                            fontSize: isSmall ? '0.875rem' : undefined,
                          }
                        }}
                      />
                
                      <Button 
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!jobDescription.trim() || !isProfileComplete}
                        leftSection={<IconReportAnalytics size={isSmall ? 14 : 16} />}
                        size={isSmall ? 'sm' : 'md'}
                        fullWidth={isSmall}
                        h={isSmall ? 48 : undefined}
                        styles={{
                          root: {
                            marginTop: isSmall ? '0.5rem' : 0
                          }
                        }}
                      >
                        Analyze Match
                      </Button>
                
                      {!isProfileComplete && (
                        <Text size="xs" c="dimmed" ta="center" mt={5}>
                          Complete your profile first to analyze job matches
                        </Text>
                      )}
                
                      {isSubmitting && (
                        <Paper p={isSmall ? "xs" : "md"} withBorder>
                          <Text size={isSmall ? "xs" : "sm"} mb="xs" fw={500}>
                            Analyzing your resume...
                          </Text>
                          <Progress value={loadingProgress} animated radius="xl" size={isSmall ? "xs" : "sm"} mx="xl" />
                        </Paper>
                      )}
                    </Stack>
                  </Card>
                </Tabs.Panel>

                <Tabs.Panel value="resume" pt="md">
                  <ResumeUploader 
                    onResumeText={handleResumeText}
                    isLoading={isSubmitting}
                  />
                </Tabs.Panel>
              </Tabs>

              {/* Recent Activity Card */}
              {analysisHistory.length > 0 && (
                <Paper 
                  withBorder 
                  radius="md" 
                  p={isSmall ? "sm" : "md"} 
                  mt={isSmall ? "sm" : "md"}
                  shadow="sm"
                >
                  <Group justify="space-between" mb={isSmall ? "xs" : "sm"}>
                    <Group gap="xs">
                      <ThemeIcon size={isSmall ? 28 : 32} radius="md" color="blue" variant="light">
                        <IconHistory size={isSmall ? 16 : 18} />
                      </ThemeIcon>
                      <Text fw={600} size={isSmall ? "sm" : "md"}>Recent Activity</Text>
                    </Group>
                    <Button 
                      variant="subtle" 
                      size={isSmall ? "xs" : "sm"}
                      rightSection={<IconChevronRight size={isSmall ? 12 : 14} />}
                      onClick={handleViewHistory}
                      px={isSmall ? 8 : undefined}
                    >
                      View All
                    </Button>
                  </Group>
                  
                  <Stack 
                    gap={isSmall ? "xs" : "md"}
                    mt={isSmall ? "sm" : "md"}
                  >
                    {analysisHistory.slice(0, 3).map((analysis, index) => (
                      <Paper 
                        key={index} 
                        withBorder 
                        p={isSmall ? "xs" : "sm"} 
                        radius="md"
                        onClick={() => navigate({ to: '/analysis' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size={isSmall ? "sm" : "md"} fw={500} lineClamp={1} mb={2}>
                              Job Match Analysis
                            </Text>
                            <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                              {new Date(analysis.timestamp).toLocaleString()}
                            </Text>
                          </Box>
                          <Badge 
                            size={isSmall ? "lg" : "xl"} 
                            radius="xl" 
                            color={getScoreColor(analysis.overallMatch)}
                            variant="filled"
                            px={isSmall ? 10 : 12}
                          >
                            <Text fw={700} size={isSmall ? "sm" : "md"} c="white">
                              {Math.round(analysis.overallMatch)}%
                            </Text>
                          </Badge>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Grid.Col>
          
            <Grid.Col span={{ base: 12, lg: 5 }}>
              {/* Resume Information Card */}
              <Paper 
                withBorder 
                radius="md" 
                p={isSmall ? "sm" : "md"}
                shadow="sm"
                style={{ height: isSmall ? 'auto' : '100%' }}
              >
                <Group mb={isSmall ? "xs" : "sm"}>
                  <ThemeIcon 
                    size={isSmall ? 36 : 42} 
                    radius="md" 
                    color="blue"
                    variant="light"
                  >
                    <IconFileText size={isSmall ? 18 : 22} />
                  </ThemeIcon>
                  <Text fw={600} size={isSmall ? "md" : "lg"}>Resume</Text>
                </Group>
                
                {resumeData ? (
                  <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card 
                      withBorder 
                      radius="md" 
                      p={isSmall ? "xs" : "sm"} 
                      bg="gray.0" 
                      mt={isSmall ? "xs" : "sm"}
                      style={{ flex: 1 }}
                    >
                      <Group justify="space-between" wrap="nowrap" mb={isSmall ? 5 : 8}>
                        <Text fw={500} size={isSmall ? "sm" : "md"} lineClamp={1} style={{flex: 1, minWidth: 0}}>
                          {resumeData.fileName}
                        </Text>
                        <Badge size={isSmall ? "xs" : "sm"} color="blue" variant="outline">
                          {resumeData.sourceType || 'pdf'}
                        </Badge>
                      </Group>
                      
                      <Group gap="xs" mt={5}>
                        <ThemeIcon color="blue" variant="light" size={isSmall ? 22 : 24} radius="xl">
                          <IconCalendar size={isSmall ? 12 : 14} />
                        </ThemeIcon>
                        <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                          Updated {new Date(resumeData.uploadDate).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Card>
                    
                    {isSmall ? (
                      <Stack 
                        gap="xs"
                        mt={isSmall ? "sm" : "md"}
                      >
                        <Button 
                          variant="light" 
                          size="sm"
                          leftSection={<IconUpload size={14} />}
                          onClick={() => setActiveTab('resume')}
                          fullWidth
                        >
                          Update Resume
                        </Button>
                        <Button 
                          variant="subtle" 
                          size="sm"
                          onClick={() => navigate({ to: '/profile' })}
                          fullWidth
                        >
                          View Details
                        </Button>
                      </Stack>
                    ) : (
                      <Group 
                        justify="space-between" 
                        mt="md"
                      >
                        <Button 
                          variant="light" 
                          size="md"
                          leftSection={<IconUpload size={16} />}
                          onClick={() => setActiveTab('resume')}
                        >
                          Update Resume
                        </Button>
                        <Button 
                          variant="subtle" 
                          size="md"
                          onClick={() => navigate({ to: '/profile' })}
                        >
                          View Details
                        </Button>
                      </Group>
                    )}
                  </Box>
                ) : (
                  <Stack gap={isSmall ? "sm" : "md"} align="center" py={isSmall ? "sm" : "md"}>
                    <Box
                      w="100%"
                      h={120}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px dashed #ddd"
                      }}
                    >
                      <ThemeIcon size={48} radius="xl" color="blue" variant="light">
                        <IconUpload size={24} />
                      </ThemeIcon>
                    </Box>
                    <Text c="dimmed" ta="center" size={isSmall ? "sm" : "md"}>
                      No resume uploaded
                    </Text>
                    <Button 
                      variant="filled" 
                      color="blue"
                      size={isSmall ? "sm" : "md"}
                      onClick={() => setActiveTab('resume')}
                    >
                      Upload Resume
                    </Button>
                  </Stack>
                )}
              </Paper>

              {/* Feature Card */}
              <Paper 
                withBorder 
                radius="md" 
                p={isSmall ? "sm" : "md"} 
                mt={isSmall ? "sm" : "md"}
                shadow="sm"
                bg="blue.0"
              >
                <Stack gap={isSmall ? "xs" : "md"}>
                  <Group>
                    <ThemeIcon 
                      size={isSmall ? 36 : 42} 
                      radius="xl" 
                      color="teal"
                      variant="light"
                    >
                      <IconRocket size={isSmall ? 18 : 22} />
                    </ThemeIcon>
                    <Box>
                      <Title order={isSmall ? 5 : 4}>Resume AI Analysis</Title>
                      <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                        Get AI-powered resume improvement tips
                      </Text>
                    </Box>
                  </Group>

                  <Grid gutter={isSmall ? "xs" : "md"}>
                    <Grid.Col span={6}>
                      <Card radius="md" p="sm" withBorder style={{height: '100%'}}>
                        <ThemeIcon 
                          size={isSmall ? 28 : 32} 
                          radius="md" 
                          color="green" 
                          variant="light"
                          mb={isSmall ? 5 : 8}
                        >
                          <IconCheck size={isSmall ? 16 : 18} />
                        </ThemeIcon>
                        <Text fw={600} size={isSmall ? "sm" : "md"}>ATS Optimization</Text>
                        <Text size="xs" c="dimmed">
                          Optimize your resume for applicant tracking systems
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Card radius="md" p="sm" withBorder style={{height: '100%'}}>
                        <ThemeIcon 
                          size={isSmall ? 28 : 32} 
                          radius="md" 
                          color="blue" 
                          variant="light"
                          mb={isSmall ? 5 : 8}
                        >
                          <IconChartBar size={isSmall ? 16 : 18} />
                        </ThemeIcon>
                        <Text fw={600} size={isSmall ? "sm" : "md"}>Skills Analysis</Text>
                        <Text size="xs" c="dimmed">
                          Identify skill gaps for your target roles
                        </Text>
                      </Card>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </ResponsiveContainer>
  );
}

// Default export for lazy loading
export default DashboardPage

// Route definition using lazy loading
export const Route = createFileRoute('/dashboard/')({
  component: createLazyRouteComponent(() => import('./index'))
}) 