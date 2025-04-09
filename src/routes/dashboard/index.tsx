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
  Card
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { StorageService } from '../../services/storageService'
import { IconHistory, IconBell } from '@tabler/icons-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)
  const [userName, setUserName] = useState('')
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
        setApiKey(savedApiKey)
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
    
    // Store the job description in localStorage
    localStorage.setItem('currentJobDescription', jobDescription)
    
    // Navigate to analysis page
    navigate({ to: '/analysis' })
  }

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      StorageService.saveOpenRouterApiKey(apiKey)
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
    <Container size="md" py="md" px="xs">
      <Modal
        opened={apiKeyModalOpen}
        onClose={() => apiKey.trim() ? setApiKeyModalOpen(false) : null}
        title="OpenRouter API Key for Resumix"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack>
          <Text size="sm">
            Resumix requires an OpenRouter API key to analyze your resume.
            Please enter your API key below.
          </Text>
          <TextInput
            label="API Key"
            placeholder="Enter your OpenRouter API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <Text size="xs" c="dimmed">
            You can get an API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a>
          </Text>
          <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
            Save API Key
          </Button>
        </Stack>
      </Modal>

      <Stack gap="lg">
        <Card withBorder p="lg" radius="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={3} size="h4">Welcome to Resumix, {userName || 'User'}!</Title>
              <Text size="sm" c="dimmed" mt={-5}>
                Ready to optimize your resume?
              </Text>
            </Stack>
            <Button 
              variant="light" 
              size="sm" 
              leftSection={<IconHistory size={16} />}
              onClick={() => navigate({ to: '/history' })}
            >
              View History
            </Button>
          </Group>
        </Card>

        {/* Notification Permission Prompt (only if default/denied) */}
        {notificationPermission !== 'granted' && 'Notification' in window && (
          <Alert
            color={notificationPermission === 'denied' ? "orange" : "blue"}
            title="Enable Notifications?"
            icon={<IconBell size={18} />}
            withCloseButton={notificationPermission === 'denied'} // Allow dismissing if denied
            onClose={() => { /* Could set a flag to not show again */ }}
            radius="md"
          >
            <Group justify="space-between">
              <Text size="sm">
                {notificationPermission === 'denied'
                  ? "Notifications are blocked. Enable them in browser settings to get background analysis updates."
                  : "Allow notifications to be alerted when background analysis is complete."
                }
              </Text>
              {notificationPermission === 'default' && (
                <Button size="xs" onClick={requestNotificationPermission}>
                  Allow
                </Button>
              )}
            </Group>
          </Alert>
        )}

        <Paper withBorder p="md" mt="xs" radius="md">
          <Stack>
            <Textarea
              placeholder="Paste the job description here..."
              label="Job Description"
              description="Copy and paste the job description you want to analyze"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              minRows={8}
              required
            />
          </Stack>
        </Paper>

        <Button
          onClick={handleSubmit}
          disabled={!jobDescription.trim()}
        >
          Analyze Match
        </Button>
      </Stack>
    </Container>
  )
} 