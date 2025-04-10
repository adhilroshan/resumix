import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Container, Title, Stepper, Group, Button, Text, Paper, Box, rem } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { ResumeUpload } from '../../components/resume/ResumeUpload'
import { UserInformation } from '../../components/resume/UserInformation'
import { SkillsInformation } from '../../components/resume/SkillsInformation'
import { StorageService } from '../../services/storageService'
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react'

export const Route = createFileRoute('/setup/')({
  component: SetupPage,
})

function SetupPage() {
  const [active, setActive] = useState(0)
  // State setters are used in component callbacks
  const [, setResumeText] = useState('')
  const [, setUserInfo] = useState({})
  const [, setSkills] = useState<string[]>([])
  const navigate = useNavigate()

  // Check if setup is already completed
  useEffect(() => {
    if (StorageService.hasCompletedSetup()) {
      const confirmContinue = window.confirm(
        'You have already completed the setup. Do you want to continue to the dashboard?'
      )

      if (confirmContinue) {
        navigate({ to: '/dashboard' })
      }
    }
  }, [navigate])

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current))
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  const handleResumeProcessed = (text: string) => {
    setResumeText(text)
    nextStep()
  }

  const handleUserInfoSave = (data: any) => {
    setUserInfo(data)
  }

  const handleSkillsSave = (userSkills: string[]) => {
    setSkills(userSkills)
  }

  const handleFinish = () => {
    // Everything is already saved to local storage in the individual components
    navigate({ to: '/dashboard' })
  }

  return (
    <Box 
      style={{ 
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
        minHeight: '100vh',
        paddingTop: rem(40),
        paddingBottom: rem(40),
      }}
    >
      <Container size="md">
        <Paper p="xl" radius="lg" shadow="sm" withBorder>
          <Title order={2} fw={700} mb="sm">Setup Your Profile</Title>
          <Text c="dimmed" mb="xl">
            Complete these steps to get accurate job match recommendations
          </Text>

          <Stepper 
            active={active} 
            onStepClick={setActive} 
            mb="xl"
            color="primary"
            size="md"
          >
            <Stepper.Step 
              label="Resume Upload" 
              description="Upload your PDF resume"
              completedIcon={<IconCheck size={18} />}
            >
              <Paper p="lg" withBorder radius="md" style={{ backgroundColor: '#f9fbff' }}>
                <ResumeUpload onResumeProcessed={handleResumeProcessed} />
              </Paper>
            </Stepper.Step>

            <Stepper.Step 
              label="Personal Info" 
              description="Your personal information"
              completedIcon={<IconCheck size={18} />}
            >
              <Paper p="lg" withBorder radius="md" style={{ backgroundColor: '#f9fbff' }}>
                <UserInformation onSave={handleUserInfoSave} />
              </Paper>
            </Stepper.Step>

            <Stepper.Step 
              label="Skills" 
              description="Add your skills"
              completedIcon={<IconCheck size={18} />}
            >
              <Paper p="lg" withBorder radius="md" style={{ backgroundColor: '#f9fbff' }}>
                <SkillsInformation onSave={handleSkillsSave} />
              </Paper>
            </Stepper.Step>
          </Stepper>

          <Group justify="flex-end" mt="xl">
            {active > 0 && (
              <Button 
                variant="default" 
                onClick={prevStep}
                leftSection={<IconArrowLeft size={16} />}
                radius="md"
              >
                Back
              </Button>
            )}

            {active < 2 ? (
              <Button 
                onClick={nextStep}
                rightSection={<IconArrowRight size={16} />}
                radius="md"
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
                rightSection={<IconCheck size={16} />}
                radius="md"
                color="green"
              >
                Complete Setup
              </Button>
            )}
          </Group>
        </Paper>
      </Container>
    </Box>
  )
}