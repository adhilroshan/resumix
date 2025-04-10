import { createFileRoute } from '@tanstack/react-router'
import { Button, Container, Title, Text, Stack, Group, Box, Paper, Grid, ThemeIcon, rem } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { IconRocket, IconTarget, IconFileAnalytics, IconChartBar } from '@tabler/icons-react'
import { useEffect } from 'react'
import { clearServiceWorkerCache } from '../utils/swUtils'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  // Force clear cache when landing page loads, to ensure UI updates are visible
  useEffect(() => {
    const forceUIUpdate = async () => {
      try {
        // This will clear any cached versions of the UI
        await clearServiceWorkerCache();
        console.log('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    };
    
    forceUIUpdate();
  }, []);

  const features = [
    {
      icon: <IconTarget size={24} />,
      title: 'Resume Matching',
      description: 'AI-powered analysis to match your resume against specific job descriptions'
    },
    {
      icon: <IconFileAnalytics size={24} />,
      title: 'Skills Gap Analysis',
      description: 'Identify missing skills and qualifications for your target roles'
    },
    {
      icon: <IconChartBar size={24} />,
      title: 'Improvement Insights',
      description: 'Get personalized recommendations to improve your resume and application'
    }
  ]

  return (
    <Box style={{ 
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
      minHeight: '100vh',
    }}>
      {/* Hero Section */}
      <Container size="xl" py={rem(80)}>
        <Grid gutter={50} align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              <Box>
                <Text 
                  size="xl" 
                  fw={700} 
                  variant="gradient" 
                  gradient={{ from: '#1579ff', to: '#0066ff', deg: 90 }}
                >
                  RESUMIX
                </Text>
                <Title 
                  order={1} 
                  size="h1" 
                  fw={900}
                  style={{ fontSize: rem(48), lineHeight: 1.2 }}
                >
                  Land Your Dream Job with AI-Powered Resume Analysis
                </Title>
                <Text size="lg" mt="md" color="dimmed" lh={1.6}>
                  Match your resume to job descriptions with precision, identify skill gaps, and receive 
                  tailored recommendations to increase your interview chances.
                </Text>
              </Box>

              <Group mt="xl">
                <Button 
                  size="lg"
                  radius="md"
                  onClick={() => navigate({ to: '/setup' })}
                  style={{ paddingLeft: rem(24), paddingRight: rem(24) }}
                  rightSection={<IconRocket size={18} />}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  radius="md"
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  Continue to Dashboard
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', justifyContent: 'center' }}>
            <Box 
              style={{ 
                width: '100%', 
                maxWidth: rem(500),
                position: 'relative',
                marginBottom: rem(20),
                marginTop: rem(20)
              }}
            >
              <Paper
                shadow="md"
                radius="lg"
                p="md"
                withBorder
                style={{ 
                  height: rem(320),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  overflow: 'hidden'
                }}
              >
                <svg width="360" height="220" viewBox="0 0 360 220">
                  <rect x="50" y="20" width="260" height="30" rx="4" fill="#e0f2ff" />
                  <rect x="50" y="60" width="180" height="20" rx="4" fill="#b3d9ff" />
                  <rect x="50" y="90" width="230" height="20" rx="4" fill="#b3d9ff" />
                  <rect x="50" y="120" width="200" height="20" rx="4" fill="#b3d9ff" />
                  <rect x="50" y="170" width="80" height="30" rx="4" fill="#1579ff" />
                  <circle cx="300" cy="170" r="30" fill="#f0f7ff" stroke="#1579ff" strokeWidth="3" />
                  <text x="300" y="175" textAnchor="middle" fill="#1579ff" fontSize="18" fontWeight="bold">85%</text>
                </svg>
              </Paper>
              
              {/* Decorative elements */}
              <Box 
                style={{ 
                  position: 'absolute', 
                  width: rem(150), 
                  height: rem(150), 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(84,166,255,0.2) 0%, rgba(84,166,255,0) 70%)',
                  top: rem(-50),
                  right: rem(-40),
                  zIndex: 0
                }} 
              />
              <Box 
                style={{ 
                  position: 'absolute', 
                  width: rem(100), 
                  height: rem(100), 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(84,166,255,0.15) 0%, rgba(84,166,255,0) 70%)',
                  bottom: rem(-20),
                  left: rem(-30),
                  zIndex: 0
                }} 
              />
            </Box>
          </Grid.Col>
        </Grid>
        
        {/* Features Section */}
        <Box mt={rem(80)}>
          <Grid gutter={30}>
            {features.map((feature, index) => (
              <Grid.Col span={{ base: 12, sm: 4 }} key={index}>
                <Paper
                  shadow="sm"
                  p="xl"
                  radius="md"
                  withBorder
                  style={{ height: '100%' }}
                >
                  <ThemeIcon 
                    size={60} 
                    radius="md" 
                    variant="light" 
                    color="primary" 
                    mb="md"
                  >
                    {feature.icon}
                  </ThemeIcon>
                  <Text fw={700} size="lg" mb="xs">{feature.title}</Text>
                  <Text size="sm" color="dimmed" lh={1.6}>
                    {feature.description}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  )
} 