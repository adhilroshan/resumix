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
  Avatar,
  ThemeIcon,
  Divider,
  Box
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { StorageService } from '../../services/storageService'
import { IconSearch, IconKey, IconUser, IconBrandOpenai, IconArrowRight } from '@tabler/icons-react'

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
    
    // Load user info for display
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
      <Container size="md" py="xl" px="xs">
        <Alert 
          color="blue" 
          title="Setup Required" 
          radius="md"
          icon={<IconUser size={16} />}
        >
          You need to complete the setup process first. Redirecting to setup...
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="md" py="md" px="xs">
      <Stack gap="md">
        {/* User greeting */}
        <Card p="md" radius="md" withBorder>
          <Group>
            <Avatar color="blue" radius="xl" size="lg">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Text fw={500} size="lg">
                {userName ? `Hello, ${userName.split(' ')[0]}!` : 'Welcome!'}
              </Text>
              <Text size="sm" c="dimmed">
                Find your perfect career match
              </Text>
            </Box>
          </Group>
        </Card>

        <Title order={2} size="h3" my="xs" ta="center">Job Match Analysis</Title>
        
        <Text ta="center" size="sm">
          Paste a job description below to analyze how well your resume matches the requirements.
        </Text>

        <Paper withBorder p="md" mt="xs" radius="md">
          <Textarea
            placeholder="Paste the job description here..."
            label={
              <Text fw={500} mb="xs">
                <IconSearch size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Job Description
              </Text>
            }
            description="Copy and paste the job description you want to analyze"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            minRows={6}
            autosize
            maxRows={12}
            radius="md"
            required
            styles={{
              input: {
                fontSize: '16px',  // Better for mobile readability
              }
            }}
          />
          
          <Button 
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!jobDescription.trim()}
            mt="md"
            radius="md"
            rightSection={<IconArrowRight size={16} />}
            style={{ height: '50px' }}
          >
            Analyze Match
          </Button>
        </Paper>

        <Divider my="xs" />

        <Group grow>
          <Button 
            size="md" 
            radius="md" 
            variant="outline" 
            leftSection={<IconUser size={18} />}
            onClick={() => navigate({ to: '/setup' })}
            style={{ height: '46px' }}
          >
            Edit Profile
          </Button>
          <Button 
            size="md" 
            radius="md" 
            variant="light" 
            leftSection={<IconKey size={18} />}
            onClick={() => setApiKeyModalOpen(true)}
            style={{ height: '46px' }}
          >
            Set API Key
          </Button>
        </Group>
      </Stack>

      {/* API Key Modal */}
      <Modal
        opened={apiKeyModalOpen}
        onClose={() => apiKey.trim() ? setApiKeyModalOpen(false) : null}
        title={
          <Group>
            <ThemeIcon size="md" radius="xl" color="violet">
              <IconBrandOpenai size={16} />
            </ThemeIcon>
            <Text fw={600}>OpenRouter API Key</Text>
          </Group>
        }
        closeOnClickOutside={false}
        closeOnEscape={false}
        radius="md"
        padding="lg"
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
            size="md"
            radius="md"
            leftSection={<IconKey size={16} />}
            styles={{
              input: {
                fontSize: '16px',  // Better for mobile readability
              }
            }}
          />
          <Text size="xs" c="dimmed">
            You can get an API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a>
          </Text>
          <Button 
            onClick={handleSaveApiKey} 
            disabled={!apiKey.trim()}
            size="lg"
            radius="md"
            fullWidth
            mt="sm"
          >
            Save API Key
          </Button>
        </Stack>
      </Modal>
    </Container>
  )
} 