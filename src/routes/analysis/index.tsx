import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Progress, 
  Stack, 
  Button, 
  Grid, 
  Card, 
  Alert, 
  Center, 
  RingProgress, 
  Group, 
  Badge,
  ThemeIcon,
  Skeleton,
  Divider,
  rem
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { analyzeResumeMatch } from '../../services/openRouterService'
import { StorageService } from '../../services/storageService'
import { 
  IconArrowBack, 
  IconX, 
  IconAlertTriangle, 
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
        
        // Check if we have all the necessary data
        const resumeData = StorageService.getResumeData()
        const userInfo = StorageService.getUserInformation()
        const skills = StorageService.getUserSkills()
        const jobDescription = localStorage.getItem('currentJobDescription')
        
        if (!resumeData || !userInfo || !skills.length || !jobDescription) {
          throw new Error('Missing required data for analysis')
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
        
        // Save the result to storage
        StorageService.saveAnalysisResult(
          { 
            overallMatch: result.overallMatch,
            skillsMatch: result.skillsMatch,
            experienceMatch: result.experienceMatch,
            recommendations: result.recommendations,
            missingSkills: result.missingSkills,
            jobDescription: jobDescription,
          }, 
          jobDescription
        )
        
        setAnalysisResult(result)
      } catch (error) {
        console.error('Failed to analyze:', error)
        setError(error instanceof Error ? error.message : 'Failed to analyze resume')
        
        // Try to load the last result if available
        const lastResult = StorageService.getLastAnalysisResult()
        if (lastResult) {
          setAnalysisResult(lastResult)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  if (error && !analysisResult) {
    return (
      <Container size="md" py="md" px="xs">
        <Alert 
          color="red" 
          title="Error" 
          mb="lg" 
          radius="md"
          icon={<IconX size={18} />}
        >
          {error}. Please go back and try again.
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

  return (
    <Container size="md" py="md" px="xs">
      <Stack gap="md">
        <Title order={2} ta="center" size="h3">Resume Match Analysis</Title>
        
        {isLoading ? (
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
              
              <Stack gap="md" mt="md" style={{ width: '100%' }}>
                <Skeleton height={8} radius="xl" />
                <Skeleton height={8} radius="xl" width="70%" />
                <Skeleton height={8} radius="xl" width="50%" />
              </Stack>
            </Stack>
          </Card>
        ) : (
          <>
            {error && (
              <Alert 
                color="yellow" 
                title="Warning" 
                mb="md" 
                radius="md"
                icon={<IconAlertTriangle size={16} />}
              >
                {error}. Showing last available analysis results.
              </Alert>
            )}
            
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
          </>
        )}
      </Stack>
    </Container>
  )
} 