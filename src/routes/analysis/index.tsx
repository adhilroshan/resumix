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
  List,
  Grid,
  Divider,
  Paper
} from '@mantine/core'
import { 
  IconX, 
  IconCheck, 
  IconArrowLeft, 
  IconAlertCircle, 
  IconReportAnalytics, 
  IconBriefcase,
  IconListCheck,
  IconBulb 
} from '@tabler/icons-react'
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
      <Container size="lg" py="xl">
        <Center style={{ height: rem(300) }}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text c="dimmed">Analyzing results...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Box
          style={{ 
            background: 'linear-gradient(135deg, #fff0f0 0%, #ffecec 100%)',
            borderRadius: rem(12),
            padding: rem(32),
            marginBottom: rem(24),
            border: '1px solid #ffcdd2'
          }}
        >
          <Stack gap="lg" align="center">
            <ThemeIcon size={rem(80)} radius="xl" color="red" variant="light">
              <IconAlertCircle size={rem(40)} />
            </ThemeIcon>
            <Title order={2} ta="center">Analysis Error</Title>
            <Text ta="center" size="lg">{error}</Text>
            <Button 
              mt="md" 
              size="md"
              radius="md"
              leftSection={<IconArrowLeft size={rem(16)} />}
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Box>
      </Container>
    )
  }

  if (!analysisResult) {
    return (
      <Container size="lg" py="xl">
        <Box
          style={{ 
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
            borderRadius: rem(12),
            padding: rem(32),
            marginBottom: rem(24),
            border: '1px solid #d1e6ff'
          }}
        >
          <Stack gap="lg" align="center">
            <ThemeIcon size={rem(80)} radius="xl" color="blue" variant="light">
              <IconAlertCircle size={rem(40)} />
            </ThemeIcon>
            <Title order={2} ta="center">No Analysis Found</Title>
            <Text ta="center" size="lg">No analysis result found. Please analyze a job description first.</Text>
            <Button 
              mt="md" 
              size="md"
              radius="md"
              leftSection={<IconArrowLeft size={rem(16)} />}
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Box>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl" px="md">
      <Stack gap="xl">
        {/* Header Section */}
        <Box 
          style={{ 
            background: 'linear-gradient(135deg, #f5f9ff 0%, #eaf4ff 100%)',
            borderRadius: rem(12),
            padding: rem(24),
            marginBottom: rem(10),
            border: '1px solid #d1e6ff'
          }}
        >
          <Grid align="center">
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <Stack gap={5}>
                <Text fw={500} tt="uppercase" fz="sm" c="dimmed">Analysis Results</Text>
                <Title order={2} size="h3" fw={700}>Resume Match Analysis</Title>
                <Text size="md" c="dimmed" maw={600}>
                  Review how well your resume matches the job description
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button 
                variant="light" 
                leftSection={<IconArrowLeft size={rem(18)} />}
                onClick={handleBackToDashboard}
                radius="md"
                size="md"
              >
                Back to Dashboard
              </Button>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Score Overview */}
        <Card shadow="sm" p="xl" radius="lg" withBorder>
          <Group mb="lg">
            <ThemeIcon size={42} radius="md" variant="light" color="primary">
              <IconReportAnalytics size={24} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={3} size="h4">Match Scores</Title>
              <Text size="sm" c="dimmed">Overall compatibility with the job requirements</Text>
            </Stack>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p="md" withBorder radius="md" style={{ height: '100%' }}>
                <Stack align="center" gap="xs">
                  <Text fw={500} size="sm" c="dimmed">Overall Match</Text>
                  <ThemeIcon 
                    size={80} 
                    radius="xl" 
                    color={getScoreColor(analysisResult.overallMatch)}
                    variant="light"
                  >
                    <Text fw={700} fz={24}>{analysisResult.overallMatch}%</Text>
                  </ThemeIcon>
                  <Progress 
                    value={analysisResult.overallMatch} 
                    color={getScoreColor(analysisResult.overallMatch)} 
                    size="md" 
                    radius="xl"
                    mt="xs"
                    style={{ width: '80%' }}
                  />
                </Stack>
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p="md" withBorder radius="md" style={{ height: '100%' }}>
                <Stack align="center" gap="xs">
                  <Text fw={500} size="sm" c="dimmed">Skills Match</Text>
                  <ThemeIcon 
                    size={80} 
                    radius="xl" 
                    color="blue"
                    variant="light"
                  >
                    <Text fw={700} fz={24}>{analysisResult.skillsMatch}%</Text>
                  </ThemeIcon>
                  <Progress 
                    value={analysisResult.skillsMatch} 
                    color="blue" 
                    size="md" 
                    radius="xl"
                    mt="xs"
                    style={{ width: '80%' }}
                  />
                </Stack>
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p="md" withBorder radius="md" style={{ height: '100%' }}>
                <Stack align="center" gap="xs">
                  <Text fw={500} size="sm" c="dimmed">Experience Match</Text>
                  <ThemeIcon 
                    size={80} 
                    radius="xl" 
                    color="violet"
                    variant="light"
                  >
                    <Text fw={700} fz={24}>{analysisResult.experienceMatch}%</Text>
                  </ThemeIcon>
                  <Progress 
                    value={analysisResult.experienceMatch} 
                    color="violet" 
                    size="md" 
                    radius="xl"
                    mt="xs"
                    style={{ width: '80%' }}
                  />
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Recommendations & Missing Skills */}
        <Grid gutter={20}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" p="lg" radius="lg" withBorder>
              <Group mb="md">
                <ThemeIcon size={36} radius="md" color="green" variant="light">
                  <IconBulb size={20} />
                </ThemeIcon>
                <Title order={4}>Recommendations</Title>
              </Group>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="green" size={20} radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                }
              >
                {analysisResult.recommendations.map((rec, index) => (
                  <List.Item key={index}>{rec}</List.Item>
                ))}
                {analysisResult.recommendations.length === 0 && (
                  <Text c="dimmed" fs="italic">No recommendations available.</Text>
                )}
              </List>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" p="lg" radius="lg" withBorder>
              <Group mb="md">
                <ThemeIcon size={36} radius="md" color="orange" variant="light">
                  <IconListCheck size={20} />
                </ThemeIcon>
                <Title order={4}>Missing Skills</Title>
              </Group>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="orange" size={20} radius="xl">
                    <IconX size={12} />
                  </ThemeIcon>
                }
              >
                {analysisResult.missingSkills.map((skill, index) => (
                  <List.Item key={index}>{skill}</List.Item>
                ))}
                {analysisResult.missingSkills.length === 0 && (
                  <Text c="dimmed" fs="italic">No missing skills identified.</Text>
                )}
              </List>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Job Description */}
        <Card shadow="sm" p="lg" radius="lg" withBorder>
          <Group mb="md">
            <ThemeIcon size={36} radius="md" color="gray" variant="light">
              <IconBriefcase size={20} />
            </ThemeIcon>
            <Title order={4}>Job Description</Title>
          </Group>
          <Divider mb="md" />
          <Box style={{ maxHeight: rem(300), overflow: 'auto' }}>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{analysisResult.jobDescription}</Text>
          </Box>
        </Card>

        {/* Actions */}
        <Group justify="flex-end">
          <Button variant="light" onClick={handleViewHistory} radius="md">
            View Analysis History
          </Button>
          <Button onClick={handleBackToDashboard} radius="md">
            Back to Dashboard
          </Button>
        </Group>
      </Stack>
    </Container>
  )
} 