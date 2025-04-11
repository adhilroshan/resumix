import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Modal,
  Group,
  Button,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Box,
  Stepper,
  rem,
  Paper,
  Image,
  Transition,
  Center
} from '@mantine/core';
import {
  IconUserCircle,
  IconFileUpload,
  IconFileDescription,
  IconChartBar,
  IconArrowRight,
  IconCheck,
  IconBell,
  IconRocket,
  IconFileAnalytics,
  IconStar,
  IconDeviceDesktopAnalytics,
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconFileTypePdf,
  IconFileText
} from '@tabler/icons-react';
import { useResponsiveSizes } from './ResponsiveContainer';

interface UserOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  requestNotificationPermission?: () => void;
}

export function UserOnboarding({ isOpen, onComplete, requestNotificationPermission }: UserOnboardingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [opened, setOpened] = useState(isOpen);
  const [animationKey, setAnimationKey] = useState(0);
  const navigate = useNavigate();
  const { isSmall } = useResponsiveSizes();
  
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [activeStep]);
  
  const steps = [
    {
      title: 'Welcome to Resume Matcher',
      description: 'Get personalized job match analysis and improve your chances of landing your dream job.',
      icon: <IconRocket size={isSmall ? 20 : 24} />,
      image: '/resumix-banner.png',
      examples: [
        { icon: <IconFileAnalytics size={28} />, text: 'Smart resume analysis' },
        { icon: <IconStar size={28} />, text: 'Skill matching' },
        { icon: <IconDeviceDesktopAnalytics size={28} />, text: 'Job fit scoring' }
      ],
      action: null
    },
    {
      title: 'Complete Your Profile',
      description: 'Start by setting up your profile with your personal information and skills.',
      icon: <IconUserCircle size={isSmall ? 20 : 24} />,
      image: '/profile-example.png',
      examples: [
        { icon: <IconUser size={28} />, text: 'Personal details' },
        { icon: <IconBriefcase size={28} />, text: 'Work experience' },
        { icon: <IconCertificate size={28} />, text: 'Education' }
      ],
      action: () => navigate({ to: '/profile' })
    },
    {
      title: 'Upload Your Resume',
      description: 'Upload your resume to analyze it against job descriptions.',
      icon: <IconFileUpload size={isSmall ? 20 : 24} />,
      image: '/resume-upload.png',
      examples: [
        { icon: <IconFileUpload size={28} />, text: 'PDF uploads' },
        { icon: <IconFileText size={28} />, text: 'Text format' },
        { icon: <IconFileTypePdf size={28} />, text: 'Automatic parsing' }
      ],
      action: null
    },
    {
      title: 'Enter Job Descriptions',
      description: 'Paste job descriptions to see how well your resume matches the requirements.',
      icon: <IconFileDescription size={isSmall ? 20 : 24} />,
      image: null,
      action: null
    },
    {
      title: 'Get Match Analysis',
      description: 'Review your match score and get suggestions to improve your resume.',
      icon: <IconChartBar size={isSmall ? 20 : 24} />,
      image: null,
      action: null
    },
    {
      title: 'Enable Notifications',
      description: 'Get notified when your analysis is complete.',
      icon: <IconBell size={isSmall ? 20 : 24} />,
      image: null,
      action: requestNotificationPermission
    }
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((current) => current + 1);
    }
  };

  const handleComplete = () => {
    setOpened(false);
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setOpened(false);
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleStepClick = (step: number) => {
    if (step <= activeStep) {
      setActiveStep(step);
    }
  };

  const handleAction = () => {
    const currentStep = steps[activeStep];
    if (currentStep.action) {
      handleComplete();
      currentStep.action();
    } else {
      handleNext();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleSkip}
      size={isSmall ? "full" : "lg"}
      padding={isSmall ? "xs" : "md"}
      withCloseButton={true}
      title={<Title order={4}>Getting Started</Title>}
      fullScreen={isSmall}
      styles={{
        title: {
          fontWeight: 600
        },
        body: {
          paddingTop: isSmall ? rem(10) : rem(20)
        },
        content: {
          borderRadius: isSmall ? 0 : rem(8)
        }
      }}
      centered
      classNames={{
        content: 'touch-ripple'
      }}
    >
      <Box mb={isSmall ? "md" : "xl"}>
        <Stepper 
          active={activeStep} 
          onStepClick={handleStepClick}
          orientation="horizontal"
          allowNextStepsSelect={false}
          styles={{
            steps: {
              flexWrap: isSmall ? 'wrap' : 'nowrap',
              justifyContent: 'center',
              gap: isSmall ? rem(4) : undefined
            },
            step: {
              marginTop: isSmall ? rem(8) : undefined,
              marginBottom: isSmall ? rem(8) : undefined,
              flexBasis: isSmall ? '30%' : undefined
            },
            stepBody: {
              margin: isSmall ? '2px 0' : undefined
            }
          }}
        >
          {steps.map((step, index) => (
            <Stepper.Step 
              key={index} 
              label={isSmall ? undefined : step.title}
              icon={step.icon}
              completedIcon={<IconCheck size={isSmall ? 14 : 18} />}
            />
          ))}
        </Stepper>
      </Box>
      
      <Transition
        mounted={true}
        transition="fade"
        duration={300}
        timingFunction="ease"
        key={animationKey}
      >
        {(styles) => (
          <Paper 
            p={isSmall ? "md" : "xl"} 
            radius="md" 
            withBorder 
            mb="xl"
            className="modern-card"
            style={{
              ...styles,
              background: 'linear-gradient(135deg, #f5f9ff 0%, #eaf4ff 100%)',
              minHeight: rem(isSmall ? 300 : 360),
              transform: 'translateY(0)', // Initial position for animation
              animation: 'slideUp 0.3s ease-out forwards',
            }}
          >
            <Stack gap="lg" align="center">
              <ThemeIcon 
                size={isSmall ? 60 : 80} 
                radius="xl" 
                color="blue" 
                variant="light"
                style={{
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                {steps[activeStep].icon}
              </ThemeIcon>
              
              <Title order={isSmall ? 3 : 2} ta="center" className="animated-title" style={{
                animation: 'fadeIn 0.5s ease-out'
              }}>
                {steps[activeStep].title}
              </Title>
              
              <Text size={isSmall ? "sm" : "md"} ta="center" maw={600} style={{ 
                lineHeight: 1.5,
                animation: 'fadeIn 0.5s ease-out 0.2s both'
              }}>
                {steps[activeStep].description}
              </Text>
              
              {steps[activeStep].image && (
                <Image 
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  width={isSmall ? 280 : 400}
                  fit="contain"
                  radius="md"
                  my="md"
                  style={{
                    animation: 'fadeIn 0.5s ease-out 0.3s both',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--gray-200)'
                  }}
                />
              )}
              
              {steps[activeStep].examples && (
                <div className="example-grid">
                  {steps[activeStep].examples.map((example, idx) => (
                    <Center key={idx}>
                      <Transition
                        mounted={true}
                        transition="slide-up"
                        duration={300}
                      >
                        {(transStyles) => (
                          <Paper
                            p="md"
                            radius="md"
                            withBorder
                            shadow="sm"
                            className="touch-ripple"
                            style={{
                              ...transStyles,
                              width: '100%',
                              textAlign: 'center',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              cursor: 'pointer',
                              animation: `slideUp 0.3s ease-out ${idx * 100}ms both`
                            }}
                          >
                            <ThemeIcon
                              size={50}
                              radius="md"
                              variant="light"
                              color="blue"
                              mb="sm"
                            >
                              {example.icon}
                            </ThemeIcon>
                            <Text size="sm" fw={500}>{example.text}</Text>
                          </Paper>
                        )}
                      </Transition>
                    </Center>
                  ))}
                </div>
              )}
            </Stack>
          </Paper>
        )}
      </Transition>
      
      <Group justify="space-between">
        <Button 
          variant="subtle" 
          onClick={handleSkip}
          className="touch-ripple"
        >
          Skip Tour
        </Button>
        
        <Button 
          onClick={handleAction}
          rightSection={activeStep === steps.length - 1 ? <IconCheck size={16} /> : <IconArrowRight size={16} />}
          className="action-button touch-ripple"
          style={{
            background: 'var(--primary-color)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)'
          }}
        >
          {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </Group>
    </Modal>
  );
}

// Helper function to check if onboarding should be shown
export function shouldShowOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('onboarding_completed') !== 'true';
} 