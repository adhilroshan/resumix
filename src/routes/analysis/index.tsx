import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo, memo } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
  Group, 
  Badge,
  ThemeIcon,
  rem,
  Progress,
  Box,
  List,
  Grid,
  Divider,
  Paper
} from '@mantine/core'
import { 
  IconArrowLeft, 
  IconAlertCircle, 
  IconBriefcase,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { StorageService } from '../../services/storageService'
import type { AnalysisResult } from '../../services/storageService'
import { createLazyRouteComponent } from '../../utils/routeUtils'
import { ErrorDisplay } from '../../components/ErrorDisplay'
import { LoadingScreen } from '../../components/LoadingScreen'
import { AsyncContentLoader } from '../../components/AsyncContentLoader'

// Component implementation separated for better code splitting
function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Add a loading state
  const [isPageLoading, setIsPageLoading] = useState(true)

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
        // Add a small delay to prevent flickering for fast loads
        setTimeout(() => {
          setIsPageLoading(false)
        }, 300)
      }
    }

    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsPageLoading(false)
      loadAnalysisResult()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  const handleBackToDashboard = () => {
    navigate({ to: '/dashboard' })
  }

  const handleViewHistory = () => {
    navigate({ to: '/history' })
  }

  const handleRetry = () => {
    setError(null)
    setIsPageLoading(true)
    try {
      const result = StorageService.getLastAnalysisResult()
      if (result) {
        setAnalysisResult(result)
        setIsPageLoading(false)
      } else {
        setError('No analysis result found. Please analyze a job description first.')
        setIsPageLoading(false)
      }
    } catch (err) {
      console.error('Error loading analysis result:', err)
      setError('Failed to load analysis result. Please try again.')
      setIsPageLoading(false)
    }
  }

  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green'
    if (score >= 50) return 'yellow'
    return 'red'
  }

  // Memoized analysis result card to prevent unnecessary re-renders
  const AnalysisResultCard = memo(({ result }: { result: AnalysisResult }) => {
    // Memoize the color calculations to avoid recalculating on every render
    const colors = useMemo(() => {
      return {
        overall: getScoreColor(result.overallMatch),
        skills: getScoreColor(result.skillsMatch),
        experience: getScoreColor(result.experienceMatch)
      };
    }, [result.overallMatch, result.skillsMatch, result.experienceMatch]);

    return (
      <Card shadow="sm" p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Group justify="space-between">
            <Stack gap={0}>
              <Text fw={500} fz="lg">Overall Match</Text>
              <Group>
                <Progress 
                  value={result.overallMatch} 
                  color={colors.overall}
                  size="xl"
                  radius="xl"
                  style={{ width: rem(300) }}
                />
                <Badge size="xl" color={colors.overall}>{result.overallMatch}%</Badge>
              </Group>
            </Stack>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder shadow="xs" radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={500}>Skills Match</Text>
                    <Badge size="lg" color={colors.skills}>{result.skillsMatch}%</Badge>
                  </Group>
                  <Progress 
                    value={result.skillsMatch} 
                    color={colors.skills}
                    size="md"
                    radius="xl"
                  />
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder shadow="xs" radius="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={500}>Experience Match</Text>
                    <Badge size="lg" color={colors.experience}>{result.experienceMatch}%</Badge>
                  </Group>
                  <Progress 
                    value={result.experienceMatch} 
                    color={colors.experience}
                    size="md"
                    radius="xl"
                  />
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    );
  });
  
  if (isPageLoading) {
    return <LoadingScreen variant="inline" text="Loading analysis results..." />
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        type="notFound"
        onBack={handleBackToDashboard}
        onRetry={handleRetry}
        onNavigateHome={handleBackToDashboard}
      />
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
        <AsyncContentLoader priority="high" delay={100}>
          {analysisResult && <AnalysisResultCard result={analysisResult} />}
        </AsyncContentLoader>

        {/* Recommendations & Missing Skills */}
        <AsyncContentLoader delay={300}>
          <Grid gutter={20}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="md">Recommendations</Title>
                <List spacing="xs" icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                }>
                  {analysisResult?.recommendations.map((recommendation, index) => (
                    <List.Item key={index}>
                      <Text>{recommendation}</Text>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="md">Missing Skills</Title>
                <List spacing="xs" icon={
                  <ThemeIcon color="red" size={24} radius="xl">
                    <IconX size={16} />
                  </ThemeIcon>
                }>
                  {analysisResult?.missingSkills.map((skill, index) => (
                    <List.Item key={index}>
                      <Text>{skill}</Text>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            </Grid.Col>
          </Grid>
        </AsyncContentLoader>
        
        {/* Job Description */}
        <AsyncContentLoader delay={700} loadingText="Loading job recommendations..." priority="low">
          <Card shadow="sm" p="lg" radius="lg" withBorder>
            <Group mb="md">
              <ThemeIcon size={36} radius="md" color="gray" variant="light">
                <IconBriefcase size={20} />
              </ThemeIcon>
              <Title order={4}>Job Description</Title>
            </Group>
            <Divider mb="md" />
            <Box style={{ maxHeight: rem(300), overflow: 'auto' }}>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{analysisResult?.jobDescription || ''}</Text>
            </Box>
          </Card>
        </AsyncContentLoader>

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

// Default export for lazy loading
export default AnalysisPage

// Route definition using lazy loading
export const Route = createFileRoute('/analysis/')({
  component: createLazyRouteComponent(() => Promise.resolve({ default: AnalysisPage }))
}) 