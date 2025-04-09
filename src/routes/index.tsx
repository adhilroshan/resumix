import { createFileRoute } from '@tanstack/react-router'
import { Button, Container, Title, Text, Stack, Group } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  return (
    <Container size="md" py="xl">
      <Stack gap="lg" align="center">
        <Title order={1}>Resume Matcher</Title>
        <Text size="lg" ta="center">
          Match your resume to job descriptions and get actionable feedback to improve your chances
        </Text>
        
        <Group mt="xl">
          <Button 
            size="lg"
            onClick={() => navigate({ to: '/setup' })}
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Continue
          </Button>
        </Group>
      </Stack>
    </Container>
  )
} 