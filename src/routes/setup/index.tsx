import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Container, Title, Stepper, Group, Button } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { ResumeUpload } from '../../components/resume/ResumeUpload'
import { UserInformation } from '../../components/resume/UserInformation'
import { SkillsInformation } from '../../components/resume/SkillsInformation'
import { StorageService } from '../../services/storageService'

export const Route = createFileRoute('/setup/')({
  component: SetupPage,
})

function SetupPage() {
  const [active, setActive] = useState(0)
  const [resumeText, setResumeText] = useState('')
  const [userInfo, setUserInfo] = useState({})
  const [skills, setSkills] = useState<string[]>([])
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
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Setup Your Profile</Title>
      
      <Stepper active={active} onStepClick={setActive} mb="xl">
        <Stepper.Step label="Resume Upload" description="Upload your PDF resume">
          <ResumeUpload onResumeProcessed={handleResumeProcessed} />
        </Stepper.Step>
        
        <Stepper.Step label="Personal Info" description="Your personal information">
          <UserInformation onSave={handleUserInfoSave} />
        </Stepper.Step>
        
        <Stepper.Step label="Skills" description="Add your skills">
          <SkillsInformation onSave={handleSkillsSave} />
        </Stepper.Step>
      </Stepper>

      <Group justify="flex-end" mt="xl">
        {active > 0 && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        
        {active < 2 ? (
          <Button onClick={nextStep}>
            Next Step
          </Button>
        ) : (
          <Button onClick={handleFinish}>
            Finish
          </Button>
        )}
      </Group>
    </Container>
  )
} 