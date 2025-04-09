import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
  Alert, 
  Center, 
  RingProgress, 
  Group, 
  Badge,
  ThemeIcon,
  Divider,
  rem
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { analyzeResumeMatch } from '../../services/openRouterService'
import { StorageService } from '../../services/storageService'
import { 
  IconArrowBack, 
  IconX, 
  IconCheck, 
  IconStar, 
  IconChartBar,
  IconBulb,
  IconListCheck,
  IconLoader2
} from '@tabler/icons-react'

export const Route = createFileRoute('/analysis/')({
  component: AnalysisPage,
})

function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setAnalysisResult(null)
        
        // Check if we have all the necessary data
        const resumeData = StorageService.getResumeData()
        const userInfo = StorageService.getUserInformation()
        const skills = StorageService.getUserSkills()
        const jobDescription = localStorage.getItem('currentJobDescription')
        
        if (!resumeData || !userInfo || !skills.length || !jobDescription) {
          setError('Missing necessary information (resume, user info, or job description).')
          return
        }
        
        const result = await analyzeResumeMatch(
          {
            resumeText: resumeData.resumeText,
            userInfo: {
              fullName: userInfo.fullName,
              jobTitle: userInfo.jobTitle,
              yearsOfExperience: userInfo.yearsOfExperience,
              educationLevel: userInfo.educationLevel,
              bio: userInfo.bio,
            },
            skills,
          },
          jobDescription
        )
        
        setAnalysisResult(result)
      } catch (error) {
        console.error('Failed to analyze:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.'

        // Check if the error indicates queuing for background sync
        if (errorMessage.includes('queued for background sync')) {
          setError(errorMessage) // Set the specific queuing message
          // Optionally clear any stale analysis result if you prefer
          // setAnalysisResult(null)
        } else {
          // Handle other errors (API key missing, parsing failed, etc.)
          setError(`Analysis failed: ${errorMessage}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [navigate])

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  if (error && !isLoading) {
    // Determine alert color and title based on error message
    const isQueued = error.includes('queued for background sync');
    const alertColor = isQueued ? 'blue' : 'red';
    const alertTitle = isQueued ? 'Request Queued' : 'Analysis Error';
    const alertIcon = isQueued ? <IconLoader2 size={18} /> : <IconX size={18} />;
    const message = isQueued
      ? `Network connection issue. Your analysis request has been queued and will be processed automatically in the background when you're back online. You'll receive a notification upon completion.`
      : `${error}<br />Please check your API key in the dashboard or try again later.`;

    return (
      <Container size="md" py="md" px="xs">
        <Alert
          color={alertColor}
          title={alertTitle}
          mb="lg"
          radius="md"
          icon={alertIcon}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {message}
        </Alert>
        <Button
          leftSection={<IconArrowBack size={16} />}
          onClick={() => navigate({ to: '/dashboard' })}
          size="md"
          radius="md"
          fullWidth
        >
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container size="md" py="xl" px="xs">
        <Card withBorder p="lg" radius="md" mt="xs">
          <Stack align="center" gap="md">
            <Text fw={500} ta="center" mb="sm">
              Analyzing your resume against the job description...
            </Text>
            
            <Center style={{ position: 'relative', height: 120, width: 120 }}>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: 100, color: 'blue' }]}
                roundCaps
              />
              <IconLoader2 
                style={{ 
                  position: 'absolute', 
                  width: rem(40), 
                  height: rem(40),
                  animation: 'spin 2s linear infinite'
                }} 
              />
            </Center>
            
            <Text ta="center" size="sm" c="dimmed" mt="sm">
              This may take a moment...
            </Text>
          </Stack>
        </Card>
      </Container>
    )
  }

  if (analysisResult) {
    return (
      <Container size="md" py="md" px="xs">
        <Stack gap="md">
          <Title order={2} ta="center" size="h3">Resume Match Analysis</Title>
          
          <Card withBorder radius="md" p="md" mt="xs">
            <Stack gap="md" align="center">
              <Group>
                <IconChartBar size={24} />
                <Title order={3} size="h4">Overall Match</Title>
              </Group>
              
              <RingProgress
                size={160}
                thickness={16}
                roundCaps
                sections={[{ 
                  value: analysisResult.overallMatch, 
                  color: getScoreColor(analysisResult.overallMatch) 
                }]}
                label={
                  <Center>
                    <Text fw={700} size="xl">{analysisResult.overallMatch}%</Text>
                  </Center>
                }
              />

              <Group grow style={{ width: '100%' }} mt="xs">
                <Card withBorder p="sm" radius="md">
                  <Text fw={500} size="sm" ta="center" mb="xs">Skills Match</Text>
                  <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[{ value: analysisResult.skillsMatch, color: 'blue' }]}
                    label={
                      <Text ta="center" fw={700} size="xs">
                        {analysisResult.skillsMatch}%
                      </Text>
                    }
                  />
                </Card>
                
                <Card withBorder p="sm" radius="md">
                  <Text fw={500} size="sm" ta="center" mb="xs">Experience Match</Text>
                  <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[{ value: analysisResult.experienceMatch, color: 'violet' }]}
                    label={
                      <Text ta="center" fw={700} size="xs">
                        {analysisResult.experienceMatch}%
                      </Text>
                    }
                  />
                </Card>
              </Group>
            </Stack>
          </Card>
          
          <Card withBorder p="md" radius="md">
            <Group mb="md">
              <ThemeIcon color="green" size="md" radius="xl">
                <IconBulb size={16} />
              </ThemeIcon>
              <Title order={4}>Recommendations</Title>
            </Group>
            
            <Divider mb="md" />
            
            <Stack gap="sm">
              {analysisResult.recommendations.map((recommendation: string, index: number) => (
                <Group key={index} wrap="nowrap" align="flex-start">
                  <ThemeIcon color="green" size="sm" radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                  <Text size="sm">{recommendation}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
          
          <Card withBorder p="md" radius="md">
            <Group mb="md">
              <ThemeIcon color="blue" size="md" radius="xl">
                <IconListCheck size={16} />
              </ThemeIcon>
              <Title order={4}>Missing Skills</Title>
            </Group>
            
            <Divider mb="md" />
            
            {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
              <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                {analysisResult.missingSkills.map((skill: string, index: number) => (
                  <Badge key={index} color="blue" size="lg" radius="sm" variant="filled">
                    {skill}
                  </Badge>
                ))}
              </Group>
            ) : (
              <Center p="md">
                <Group>
                  <IconStar size={16} />
                  <Text c="dimmed">No missing skills identified</Text>
                </Group>
              </Center>
            )}
          </Card>
          
          <Button 
            fullWidth
            size="lg"
            radius="md"
            leftSection={<IconArrowBack size={16} />}
            onClick={() => navigate({ to: '/dashboard' })}
            style={{ height: '50px' }}
            mt="md"
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="md" py="md" px="xs">
      <Text>Something went wrong.</Text>
      <Button onClick={() => navigate({ to: '/dashboard' })}>Go Back</Button>
    </Container>
  )
} 