import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Container, Title, Text, Paper, Progress, Stack, Button, Grid, Card, Alert, Center } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { analyzeResumeMatch } from '../../services/openRouterService'
import { StorageService } from '../../services/storageService'

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

  if (error && !analysisResult) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Error" mb="xl">
          {error}. Please go back and try again.
        </Alert>
        <Button onClick={() => navigate({ to: '/dashboard' })}>
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Resume Match Analysis</Title>
        
        {isLoading ? (
          <Paper withBorder p="xl" mt="md">
            <Text ta="center" mb="md">Analyzing your resume against the job description...</Text>
            <Progress
              value={100}
              animated
              size="xl"
            />
          </Paper>
        ) : (
          <>
            {error && (
              <Alert color="yellow" title="Warning" mb="md">
                {error}. Showing last available analysis results.
              </Alert>
            )}
            
            <Paper withBorder p="md" mt="md">
              <Title order={3} mb="md">Overall Match</Title>
              <Center mb="sm">
                <Text fw={700} size="xl">{analysisResult.overallMatch}%</Text>
              </Center>
              <Progress
                value={analysisResult.overallMatch}
                size="xl"
                color={analysisResult.overallMatch > 75 ? 'green' : analysisResult.overallMatch > 50 ? 'yellow' : 'red'}
              />
              
              <Grid mt="xl">
                <Grid.Col span={6}>
                  <Text fw={500}>Skills Match</Text>
                  <Center>
                    <Text size="sm" fw={500} mb="xs">{analysisResult.skillsMatch}%</Text>
                  </Center>
                  <Progress
                    value={analysisResult.skillsMatch}
                    size="md"
                    color="blue"
                    mt="xs"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Experience Match</Text>
                  <Center>
                    <Text size="sm" fw={500} mb="xs">{analysisResult.experienceMatch}%</Text>
                  </Center>
                  <Progress
                    value={analysisResult.experienceMatch}
                    size="md"
                    color="violet"
                    mt="xs"
                  />
                </Grid.Col>
              </Grid>
            </Paper>
            
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Title order={4} mb="md">Recommendations</Title>
                  <Stack gap="xs">
                    {analysisResult.recommendations.map((recommendation: string, index: number) => (
                      <Text key={index}>• {recommendation}</Text>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card withBorder p="md">
                  <Title order={4} mb="md">Missing Skills</Title>
                  <Stack gap="xs">
                    {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
                      analysisResult.missingSkills.map((skill: string, index: number) => (
                        <Text key={index}>• {skill}</Text>
                      ))
                    ) : (
                      <Text c="dimmed">No missing skills identified</Text>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
            
            <Button onClick={() => navigate({ to: '/dashboard' })}>
              Back to Dashboard
            </Button>
          </>
        )}
      </Stack>
    </Container>
  )
} 