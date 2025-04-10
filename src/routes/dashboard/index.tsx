import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
  Grid
} from '@mantine/core'
import { 
  IconHistory, 
  IconBell, 
  IconRocket, 
  IconFileDescription, 
  IconKey 
} from '@tabler/icons-react'
import { StorageService } from '../../services/storageService'
import { analyzeResumeMatch } from '../../services/openRouterService'
import { ApiKeyManager } from '../../components/ApiKeyManager'
import { createLazyRouteComponent } from '../../utils/routeUtils'
import { ResponsiveContainer, useResponsiveSizes } from '../../components/ResponsiveContainer'
import { LoadingScreen } from '../../components/LoadingScreen'

// Main component implementation
function DashboardPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const navigate = useNavigate()
  const [showNotificationTip, setShowNotificationTip] = useState(false)
  const responsiveSizes = useResponsiveSizes()
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Check notification permission status once on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined' && 'Notification' in window) {
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

  return (
    <ResponsiveContainer py="xl">
      {isPageLoading ? (
        <LoadingScreen variant="inline" text="Loading dashboard..." />
      ) : (
        <Stack gap={responsiveSizes.padding.md}>
          <Modal
            opened={apiKeyModalOpen}
            onClose={() => setApiKeyModalOpen(false)}
            title="Manage API Keys"
            size="lg"
          >
            <ApiKeyManager onSave={() => setApiKeyModalOpen(false)} />
          </Modal>

          <Group justify="space-between" align="center" mb={responsiveSizes.padding.sm}>
            <Title order={2}>Resume Dashboard</Title>
            <Group>
              <Button
                leftSection={<IconHistory size={16} />}
                variant="light"
                size={responsiveSizes.isSmall ? 'sm' : 'md'}
                onClick={handleViewHistory}
              >
                History
              </Button>
              <Button
                leftSection={<IconKey size={16} />}
                variant="light"
                size={responsiveSizes.isSmall ? 'sm' : 'md'}
                onClick={() => setApiKeyModalOpen(true)}
              >
                API Key
              </Button>
            </Group>
          </Group>

          {/* Notification Permission Alert */}
          {showNotificationTip && (
            <Notification
              title="Enable Notifications"
              color="blue"
              icon={<IconBell size={18} />}
              closeButtonProps={{ 'aria-label': 'Hide notification' }}
              onClose={dismissNotification}
            >
              Enable notifications to get updates when background analysis completes.
            </Notification>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Card withBorder p={responsiveSizes.padding.md} radius="md">
                <Stack gap={responsiveSizes.padding.md}>
                  <Group>
                    <ThemeIcon size="xl" radius="md" color="blue">
                      <IconFileDescription size={24} />
                    </ThemeIcon>
                    <Box>
                      <Title order={4}>Job Description</Title>
                      <Text size="sm" c="dimmed">
                        Paste the job description to match against your resume
                      </Text>
                    </Box>
                  </Group>

                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description here..."
                    autosize
                    minRows={8}
                    maxRows={12}
                  />

                  <Button
                    leftSection={<IconRocket size={16} />}
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    fullWidth
                    size="md"
                  >
                    Analyze Match
                  </Button>

                  {isSubmitting && (
                    <Paper withBorder p="md" radius="md">
                      <Text size="sm" mb="xs" fw={500}>
                        Analyzing your resume...
                      </Text>
                      <Progress value={loadingProgress} animated radius="xl" size="sm" mx="xl" />
                    </Paper>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Paper withBorder p={responsiveSizes.padding.md} radius="md" h="100%">
                <Stack gap={responsiveSizes.padding.md}>
                  <Title order={4}>Tips</Title>
                  <Text size="sm">
                    For the best results, copy and paste the complete job description.
                    The AI will compare your resume against the requirements and provide
                    actionable recommendations.
                  </Text>
                  <Box>
                    <Text fw={500} mb="xs">Key Features:</Text>
                    <Stack gap="xs">
                      <Text size="sm">• Detailed match analysis</Text>
                      <Text size="sm">• Skills gap identification</Text>
                      <Text size="sm">• Resume improvement suggestions</Text>
                      <Text size="sm">• Tailored application advice</Text>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </ResponsiveContainer>
  )
}

// Default export for lazy loading
export default DashboardPage

// Route definition using lazy loading
export const Route = createFileRoute('/dashboard/')({
  component: createLazyRouteComponent(() => import('./index'))
}) 