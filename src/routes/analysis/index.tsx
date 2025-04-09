import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
  Group, 
  Badge,
  ThemeIcon,
  rem,
  Progress,
  Loader,
  Box,
  List
} from '@mantine/core'
import { IconX, IconCheck, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react'
import { StorageService } from '../../services/storageService'
import type { AnalysisResult } from '../../services/storageService'

export const Route = createFileRoute('/analysis/')({
  component: AnalysisPage,
})

function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadAnalysisResult = () => {
      try {
        const result = StorageService.getLastAnalysisResult()
        if (result) {
          setAnalysisResult(result)
        } else {
          setError('No analysis result found. Please analyze a job description first.')
        }
      } catch (err) {
        console.error('Error loading analysis result:', err)
        setError('Failed to load analysis result. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalysisResult()
  }, [])

  const handleBackToDashboard = () => {
    navigate({ to: '/dashboard' })
  }

  const handleViewHistory = () => {
    navigate({ to: '/history' })
  }

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green'
    if (score >= 50) return 'yellow'
    return 'red'
  }

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center style={{ height: rem(300) }}>
          <Loader size="xl" />
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert 
          icon={<IconAlertCircle size={rem(16)} />} 
          title="Error" 
          color="red" 
          variant="filled"
        >
          {error}
        </Alert>
        <Button 
          mt="md" 
          leftSection={<IconArrowLeft size={rem(16)} />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  if (!analysisResult) {
    return (
      <Container size="md" py="xl">
        <Alert 
          icon={<IconAlertCircle size={rem(16)} />} 
          title="No Analysis Found" 
          color="blue" 
          variant="filled"
        >
          No analysis result found. Please analyze a job description first.
        </Alert>
        <Button 
          mt="md" 
          leftSection={<IconArrowLeft size={rem(16)} />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Analysis Results</Title>
          <Button 
            variant="light" 
            leftSection={<IconArrowLeft size={rem(16)} />}
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </Button>
        </Group>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Job Description</Title>
            <Text>{analysisResult.jobDescription}</Text>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Overall Match</Title>
            <Group>
              <Badge size="lg" color={getScoreColor(analysisResult.overallMatch)}>
                {analysisResult.overallMatch}%
              </Badge>
              <Text>Match Score</Text>
            </Group>
            <Box>
              <Progress 
                value={analysisResult.overallMatch} 
                color={getScoreColor(analysisResult.overallMatch)} 
                size="xl" 
                radius="xl"
              />
            </Box>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Skills Match</Title>
            <Group>
              <Badge size="lg" color={getScoreColor(analysisResult.skillsMatch)}>
                {analysisResult.skillsMatch}%
              </Badge>
              <Text>Skills Match</Text>
            </Group>
            <Box>
              <Progress 
                value={analysisResult.skillsMatch} 
                color={getScoreColor(analysisResult.skillsMatch)} 
                size="xl" 
                radius="xl"
              />
            </Box>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Experience Match</Title>
            <Group>
              <Badge size="lg" color={getScoreColor(analysisResult.experienceMatch)}>
                {analysisResult.experienceMatch}%
              </Badge>
              <Text>Experience Match</Text>
            </Group>
            <Box>
              <Progress 
                value={analysisResult.experienceMatch} 
                color={getScoreColor(analysisResult.experienceMatch)} 
                size="xl" 
                radius="xl"
              />
            </Box>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Missing Skills</Title>
            {analysisResult.missingSkills.length > 0 ? (
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="red" size={rem(24)} radius="xl">
                    <IconX style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                {analysisResult.missingSkills.map((skill, index) => (
                  <List.Item key={index}>{skill}</List.Item>
                ))}
              </List>
            ) : (
              <Text c="dimmed">No missing skills identified.</Text>
            )}
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md">
          <Stack gap="md">
            <Title order={3}>Recommendations</Title>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="blue" size={rem(24)} radius="xl">
                  <IconCheck style={{ width: rem(16), height: rem(16) }} />
                </ThemeIcon>
              }
            >
              {analysisResult.recommendations.map((recommendation, index) => (
                <List.Item key={index}>{recommendation}</List.Item>
              ))}
            </List>
          </Stack>
        </Card>

        <Group justify="space-between" mt="xl">
          <Button 
            variant="light" 
            onClick={handleViewHistory}
          >
            View History
          </Button>
          <Button 
            onClick={handleBackToDashboard}
          >
            Analyze Another Job
          </Button>
        </Group>
      </Stack>
    </Container>
  )
} 