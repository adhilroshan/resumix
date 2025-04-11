import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense } from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Card, 
  Group, 
  ThemeIcon,
  rem,
  Box,
  Divider,
  ScrollArea,
  Transition
} from '@mantine/core'
import { 
  IconArrowLeft, 
  IconAlertCircle, 
  IconBriefcase,
  IconHistory,
  IconChevronRight
} from '@tabler/icons-react'
import { StorageService } from '../../services/storageService'
import type { AnalysisResult } from '../../services/storageService'
import { createLazyRouteComponent } from '../../utils/routeUtils'
import { ErrorDisplay } from '../../components/ErrorDisplay'
import { LoadingScreen } from '../../components/LoadingScreen'
import { AsyncContentLoader } from '../../components/AsyncContentLoader'

// Lazy load components for better code splitting
const AnalysisResultCard = lazy(() => import('../../components/AnalysisResultCard').then(module => ({
  default: module.AnalysisResultCard
})));

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
      <Container size="lg" py="xl" px="md">
        <Stack gap="xl">
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
                style={{ minWidth: '190px' }}
                styles={{ 
                  root: { 
                    '@media (max-width: 576px)': { 
                      width: '100%' 
                    } 
                  } 
                }}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Box>
        </Stack>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem', alignItems: 'center' }}>
            <div style={{ gridColumn: 'span 12' }} className="header-title-col">
              <Stack gap={5}>
                <Text fw={500} tt="uppercase" fz="xs" c="dimmed">ANALYSIS RESULTS</Text>
                <Title order={2} size="h3" fw={700}>Resume Match Analysis</Title>
                <Text size="sm" c="dimmed" maw={600}>
                  Review how well your resume matches the job description
                </Text>
              </Stack>
            </div>
            <div style={{ 
              gridColumn: 'span 12', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px', 
              marginTop: '1rem'
            }} className="header-button-col">
              <Button 
                variant="light" 
                leftSection={<IconArrowLeft size={rem(18)} />}
                onClick={handleBackToDashboard}
                radius="md"
                size="md"
                className="touch-ripple"
                style={{ minWidth: '190px' }}
                styles={{ 
                  root: { 
                    '@media (max-width: 576px)': { 
                      width: '100%',
                      margin: '0 auto'
                    } 
                  } 
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Box>

        {/* Score Overview */}
        <AsyncContentLoader priority="high" delay={100}>
          {analysisResult && (
            <Suspense fallback={<LoadingScreen variant="inline" text="Loading analysis card..." />}>
              <AnalysisResultCard result={analysisResult} />
            </Suspense>
          )}
        </AsyncContentLoader>

        {/* Job Description */}
        <AsyncContentLoader delay={700} loadingText="Loading job details..." priority="low">
          <Transition
            mounted={true}
            transition="fade"
            duration={400}
          >
            {(styles) => (
              <Card shadow="sm" p="md" radius="lg" withBorder style={{...styles}} className="modern-card">
                <Group mb="md">
                  <ThemeIcon size={36} radius="md" color="gray" variant="light">
                    <IconBriefcase size={20} />
                  </ThemeIcon>
                  <Title order={4}>Job Description</Title>
                </Group>
                <Divider mb="md" />
                <ScrollArea h={300} scrollbarSize={6} type="hover">
                  <Box p="xs">
                    <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      {analysisResult?.jobDescription || ''}
                    </Text>
                  </Box>
                </ScrollArea>
              </Card>
            )}
          </Transition>
        </AsyncContentLoader>

        {/* Actions */}
        <Group justify="flex-end" mt="xl" style={{
          '@media (max-width: 576px)': {
            flexDirection: 'column',
            width: '100%'
          }
        }}>
          <Button 
            variant="light" 
            onClick={handleViewHistory} 
            radius="md"
            size="md"
            leftSection={<IconHistory size={16} />}
            className="touch-ripple"
            style={{ 
              transition: 'all 0.2s ease',
            }}
            styles={{ 
              root: { 
                '@media (max-width: 576px)': { 
                  width: '100%',
                  margin: '0 auto'
                } 
              } 
            }}
          >
            View History
          </Button>
          <Button 
            onClick={handleBackToDashboard} 
            radius="md"
            size="md"
            className="touch-ripple action-button"
            style={{ 
              minWidth: '190px',
              transition: 'all 0.2s ease',
            }}
            rightSection={<IconChevronRight size={16} />}
            styles={{ 
              root: { 
                '@media (max-width: 576px)': { 
                  width: '100%',
                  margin: '0 auto'
                } 
              } 
            }}
          >
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