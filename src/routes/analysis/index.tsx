import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo, memo } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
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
  IconArrowLeft, 
  IconAlertCircle, 
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
  
  // Memoized recommendations component
  const RecommendationsCard = memo(({ recommendations }: { recommendations: string[] }) => (
    <Card shadow="sm" p="xl" radius="lg" withBorder>
      <Stack gap="md">
        <Group>
          <ThemeIcon size={28} radius="md" color="green" variant="light">
            <IconBulb size={18} />
          </ThemeIcon>
          <Text fw={500} fz="lg">Recommendations</Text>
        </Group>
        
        <List spacing="xs" icon={
          <ThemeIcon color="green" size={24} radius="xl">
            <IconBulb size={14} />
          </ThemeIcon>
        }>
          {recommendations.map((rec, index) => (
            <List.Item key={index}>
              <Text size="sm">{rec}</Text>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Card>
  ));
  
  // Memoized missing skills component
  const MissingSkillsCard = memo(({ missingSkills }: { missingSkills: string[] }) => (
    <Card shadow="sm" p="xl" radius="lg" withBorder>
      <Stack gap="md">
        <Group>
          <ThemeIcon size={28} radius="md" color="orange" variant="light">
            <IconListCheck size={18} />
          </ThemeIcon>
          <Text fw={500} fz="lg">Missing Skills</Text>
        </Group>
        
        <List spacing="xs" icon={
          <ThemeIcon color="orange" size={24} radius="xl">
            <IconListCheck size={14} />
          </ThemeIcon>
        }>
          {missingSkills.map((skill, index) => (
            <List.Item key={index}>
              <Text size="sm">{skill}</Text>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Card>
  ));

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
        <AnalysisResultCard result={analysisResult} />

        {/* Recommendations & Missing Skills */}
        <Grid gutter={20}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <RecommendationsCard recommendations={analysisResult.recommendations} />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }}>
            <MissingSkillsCard missingSkills={analysisResult.missingSkills} />
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