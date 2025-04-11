import { createFileRoute } from '@tanstack/react-router'
// import { Button, Container, Title, Text, Stack, Group, Box, Paper, Grid, ThemeIcon, rem } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
// import { IconTarget, IconFileAnalytics, IconChartBar } from '@tabler/icons-react'
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
    
    // Immediately redirect to dashboard as home
    navigate({ to: '/dashboard' });
  }, [navigate]);

  // const features = [
  //   {
  //     icon: <IconTarget size={24} />,
  //     title: 'Resume Matching',
  //     description: 'AI-powered analysis to match your resume against specific job descriptions'
  //   },
  //   {
  //     icon: <IconFileAnalytics size={24} />,
  //     title: 'Skills Gap Analysis',
  //     description: 'Identify missing skills and qualifications for your target roles'
  //   },
  //   {
  //     icon: <IconChartBar size={24} />,
  //     title: 'Improvement Insights',
  //     description: 'Get personalized recommendations to improve your resume and application'
  //   }
  // ]

  return null; // We don't need to render anything as we're redirecting
} 