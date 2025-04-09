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
  Modal
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { StorageService } from '../../services/storageService'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)
  const navigate = useNavigate()

  // Check if setup is completed
  useEffect(() => {
    const isSetupComplete = StorageService.hasCompletedSetup()
    setSetupComplete(isSetupComplete)
    
    if (!isSetupComplete) {
      const timeout = setTimeout(() => {
        navigate({ to: '/setup' })
      }, 3000)
      
      return () => clearTimeout(timeout)
    }
    
    // Check if API key is set
    const savedApiKey = StorageService.getOpenRouterApiKey()
    if (savedApiKey) {
      setApiKey(savedApiKey)
    } else {
      setApiKeyModalOpen(true)
    }
  }, [navigate])

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
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Job Matcher Dashboard</Title>
        <Text>
          Paste a job description below and we'll analyze it against your resume
          to give you personalized feedback and recommendations.
        </Text>

        <Paper withBorder p="md" mt="md">
          <Textarea
            placeholder="Paste the job description here..."
            label="Job Description"
            description="Copy and paste the job description you want to analyze"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            minRows={8}
            required
          />
          
          <Group justify="flex-end" mt="md">
            <Button 
              onClick={handleSubmit}
              disabled={!jobDescription.trim()}
            >
              Analyze Match
            </Button>
          </Group>
        </Paper>

        <Group justify="space-between">
          <Button variant="outline" onClick={() => navigate({ to: '/setup' })}>
            Edit Profile
          </Button>
          <Button variant="subtle" onClick={() => setApiKeyModalOpen(true)}>
            Set API Key
          </Button>
        </Group>
      </Stack>

      {/* API Key Modal */}
      <Modal
        opened={apiKeyModalOpen}
        onClose={() => apiKey.trim() ? setApiKeyModalOpen(false) : null}
        title="OpenRouter API Key"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack>
          <Text size="sm">
            This application requires an OpenRouter API key to analyze your resume.
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
    </Container>
  )
} 