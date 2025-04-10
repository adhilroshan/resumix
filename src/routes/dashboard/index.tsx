import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Textarea, 
  Button, 
  Stack, 
  Group, 
  TextInput,
  Alert,
  Modal,
  Card,
  Grid,
  ThemeIcon,
  Box,
  Divider,
  rem,
  Badge,
  Progress
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { StorageService } from '../../services/storageService'
import { IconHistory, IconBell, IconUpload, IconSearch, IconRocket, IconFileDescription, IconKey } from '@tabler/icons-react'
import { ApiKeyManager } from '../../components/ApiKeyManager'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const navigate = useNavigate()
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Request notification permission if not already granted or denied
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission); // USE the setter here
        // Optionally store permission status in localStorage if needed across sessions
        // localStorage.setItem('notificationPermission', permission);
      } catch (error) {
         console.error("Error requesting notification permission:", error);
         // Handle potential errors during request
      }
    }
  };

  useEffect(() => {
    const isSetupComplete = StorageService.hasCompletedSetup()
    setSetupComplete(isSetupComplete)
    
    if (!isSetupComplete) {
      const timeout = setTimeout(() => {
        navigate({ to: '/setup' })
      }, 3000)
      
      return () => clearTimeout(timeout)
    } else {
      const userInfo = StorageService.getUserInformation()
      if (userInfo) {
        setUserName(userInfo.fullName)
      }
      
      // Check if API key is set
      const savedApiKey = StorageService.getOpenRouterApiKey()
      if (savedApiKey) {
        setApiKeyModalOpen(false)
      } else {
        setApiKeyModalOpen(true)
      }

      // Check and potentially request notification permission
      if ('Notification' in window) {
         const currentPermission = Notification.permission;
         if (currentPermission !== notificationPermission) {
             setNotificationPermission(currentPermission); // USE setter if changed externally
         }
         if (currentPermission === 'default') {
           // Request permission slightly delayed on dashboard load
           const timer = setTimeout(requestNotificationPermission, 2000);
           return () => clearTimeout(timer); // Cleanup timer on unmount
         }
       } else {
         // Handle browsers that don't support Notification API
         console.log("Notification API not supported.");
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Removed notificationPermission from dependencies to avoid loop on update

  const handleSubmit = () => {
    if (!jobDescription.trim()) return
    
    // Start loading state
    setIsSubmitting(true);
    
    // Simulate progress animation
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newValue = prev + (Math.random() * 10);
        return newValue < 90 ? newValue : prev; // Cap at 90% until actual completion
      });
    }, 500);
    
    // Store the job description in localStorage
    localStorage.setItem('currentJobDescription', jobDescription)
    
    // Using setTimeout to ensure we see the loading state before navigation
    // This prevents the UI from freezing during the transition
    setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      
      // Small delay before navigation to show 100% completion
      setTimeout(() => {
        // Navigate to analysis page
        navigate({ to: '/analysis' });
        
        // Reset states after navigation
        setIsSubmitting(false);
        setLoadingProgress(0);
      }, 300);
    }, 1000);
  }

  const handleSaveApiKey = () => {
    if (apiKeyModalOpen) {
      setApiKeyModalOpen(false)
    }
  }

  if (!setupComplete) {
    return (
      <Container size="md" py="xl">
        <Alert color="blue" title="Setup Required">
          You need to complete the setup process first. Redirecting to setup...
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl" px="md">
      <Modal
        opened={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        title="OpenRouter API Key for Resumix"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <ApiKeyManager 
          onSave={() => setApiKeyModalOpen(false)} 
          showValidationStatus={true}
        />
      </Modal>

      <Stack gap="xl">
        {/* Welcome Header */}
        <Card 
          withBorder 
          p="xl" 
          radius="lg" 
          style={{ 
            background: 'linear-gradient(135deg, #f5f9ff 0%, #eaf4ff 100%)',
            borderColor: '#d1e6ff'
          }}
        >
          <Grid align="center">
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Stack gap="xs">
                <Text fz="sm" fw={500} tt="uppercase" c="dimmed">Dashboard</Text>
                <Title order={2} size="h3" fw={700}>Welcome, {userName || 'User'}!</Title>
                <Text size="md" c="dimmed" mt={4}>
                  Optimize your resume for job applications and track your progress
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="light" 
                size="md" 
                leftSection={<IconHistory size={18} />}
                onClick={() => navigate({ to: '/history' })}
                radius="md"
              >
                View Analysis History
              </Button>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Notification Permission Alert */}
        {notificationPermission !== 'granted' && 'Notification' in window && (
          <Alert
            color={notificationPermission === 'denied' ? "orange" : "blue"}
            title="Enable Notifications"
            icon={<IconBell size={20} />}
            withCloseButton={notificationPermission === 'denied'}
            onClose={() => { /* Could set a flag to not show again */ }}
            radius="md"
            styles={{
              root: {
                border: '1px solid',
                borderColor: notificationPermission === 'denied' ? '#ffe0b2' : '#bbdefb',
              }
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="sm" lh={1.5}>
                {notificationPermission === 'denied'
                  ? "Notifications are blocked. Enable them in browser settings to get background analysis updates."
                  : "Allow notifications to be alerted when background analysis is complete."
                }
              </Text>
              {notificationPermission === 'default' && (
                <Button size="sm" onClick={requestNotificationPermission} radius="md">
                  Allow
                </Button>
              )}
            </Group>
          </Alert>
        )}

        {/* Main Content */}
        <Grid gutter={30}>
          {/* Resume Analysis Section */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card shadow="sm" p={0} radius="lg" withBorder>
              <Box p="xl" mb="xs">
                <Group mb="md">
                  <ThemeIcon size={42} radius="md" variant="light" color="primary">
                    <IconFileDescription size={24} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Title order={3} size="h4">Job Description Analysis</Title>
                    <Text size="sm" c="dimmed">Match your resume against a job posting</Text>
                  </Stack>
                </Group>
                
                <Textarea
                  placeholder="Paste the job description here to analyze how well your resume matches..."
                  label="Job Description"
                  description="Copy and paste the job description you want to analyze against your resume"
                  minRows={8}
                  maxRows={12}
                  radius="md"
                  size="md"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  styles={{
                    input: {
                      border: '1px solid #e0e8f5',
                    }
                  }}
                />
                
                <Button 
                  mt="lg" 
                  size="md"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!jobDescription.trim() || isSubmitting}
                  radius="md"
                  rightSection={isSubmitting ? null : <IconRocket size={18} />}
                  loading={isSubmitting}
                >
                  {isSubmitting ? `Analyzing... ${Math.round(loadingProgress)}%` : 'Analyze Resume Match'}
                </Button>
                
                {isSubmitting && (
                  <Progress 
                    value={loadingProgress} 
                    size="sm" 
                    striped 
                    animated 
                    mt="xs" 
                    color="blue"
                    radius="xl"
                  />
                )}
              </Box>
            </Card>
          </Grid.Col>
          
          {/* API Key Section */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card shadow="sm" p={0} radius="lg" withBorder>
              <Box p="md">
                <Group mb="md">
                  <ThemeIcon size={42} radius="md" variant="light" color="primary">
                    <IconKey size={24} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Title order={3} size="h4">API Keys</Title>
                    <Text size="sm" c="dimmed">Manage your OpenRouter API keys</Text>
                  </Stack>
                </Group>
                
                <Paper p="sm" withBorder radius="md" bg="rgba(245, 247, 250, 0.5)">
                  <Group justify="apart">
                    <Text size="sm">Auto-rotate between multiple keys</Text>
                    <Button 
                      variant="light" 
                      size="xs"
                      onClick={() => setApiKeyModalOpen(true)}
                    >
                      Manage Keys
                    </Button>
                  </Group>
                </Paper>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
} 