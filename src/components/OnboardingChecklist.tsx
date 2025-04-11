import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Progress,
  Button,
  List,
  ThemeIcon,
  Box
} from '@mantine/core';
import {
  IconCircleCheck,
  IconCircleDashed,
  IconListCheck,
  IconArrowRight
} from '@tabler/icons-react';
import { useResponsiveSizes } from './ResponsiveContainer';
import { StorageService } from '../services/storageService';

interface OnboardingChecklistProps {
  onClose?: () => void;
}

export function OnboardingChecklist({ onClose }: OnboardingChecklistProps) {
  const navigate = useNavigate();
  const { isSmall } = useResponsiveSizes();
  
  // Tasks for user to complete
  const [tasks, setTasks] = useState([
    { 
      id: 'profile', 
      label: 'Complete your profile information', 
      completed: false,
      action: () => navigate({ to: '/profile' }),
      actionLabel: 'Complete Profile'
    },
    { 
      id: 'resume', 
      label: 'Upload your resume', 
      completed: false,
      action: () => navigate({ to: '/dashboard', search: { tab: 'resume' } }),
      actionLabel: 'Upload Resume'
    },
    { 
      id: 'skills', 
      label: 'Add your skills', 
      completed: false,
      action: () => navigate({ to: '/profile', search: { section: 'skills' } }),
      actionLabel: 'Add Skills'
    }
  ]);
  
  const [progress, setProgress] = useState(0);
  
  // Check task completion status
  useEffect(() => {
    const userInfo = StorageService.getUserInformation();
    const resumeData = StorageService.getResumeData();
    const userSkills = StorageService.getUserSkills();
    
    const updatedTasks = [...tasks];
    
    // Check profile completion
    if (userInfo && userInfo.fullName && userInfo.jobTitle) {
      updatedTasks[0].completed = true;
    }
    
    // Check resume upload
    if (resumeData && resumeData.resumeText) {
      updatedTasks[1].completed = true;
    }
    
    // Check skills added
    if (userSkills && userSkills.length > 0) {
      updatedTasks[2].completed = true;
    }
    
    setTasks(updatedTasks);
    
    // Calculate progress percentage
    const completedCount = updatedTasks.filter(task => task.completed).length;
    setProgress(Math.round((completedCount / updatedTasks.length) * 100));
    
  }, []);
  
  // Get the next incomplete task
  const getNextTask = () => {
    return tasks.find(task => !task.completed);
  };
  
  const nextTask = getNextTask();
  const allTasksCompleted = progress === 100;
  
  return (
    <Paper 
      withBorder 
      radius="md" 
      p={isSmall ? "md" : "xl"} 
      mb={isSmall ? "md" : "xl"}
      style={{
        background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
        border: '1px solid #e6f0ff'
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <ThemeIcon 
              size={isSmall ? 38 : 48} 
              radius="xl" 
              color="blue" 
              variant="light"
            >
              <IconListCheck size={isSmall ? 20 : 26} />
            </ThemeIcon>
            <Box>
              <Title order={isSmall ? 4 : 3}>Getting Started</Title>
              <Text size={isSmall ? "xs" : "sm"} c="dimmed">
                Complete these steps to get the most out of Resume Matcher
              </Text>
            </Box>
          </Group>
          
          {allTasksCompleted && onClose && (
            <Button 
              variant="subtle" 
              size={isSmall ? "xs" : "sm"}
              onClick={onClose}
              px={isSmall ? 10 : undefined}
            >
              Dismiss
            </Button>
          )}
        </Group>
        
        <Progress 
          value={progress} 
          size={isSmall ? "md" : "lg"} 
          radius="xl" 
          color={progress === 100 ? "green" : "blue"}
          striped={progress < 100}
          animated={progress < 100}
        />
        
        <Text size={isSmall ? "sm" : "md"} fw={500} ta="center">
          {progress === 100 
            ? 'All set! You\'re ready to analyze job matches.' 
            : `${progress}% Complete`
          }
        </Text>
        
        <List 
          spacing={isSmall ? "md" : "lg"}
          icon={null}
          center
          size={isSmall ? "sm" : "md"}
        >
          {tasks.map((task) => (
            <List.Item
              key={task.id}
              icon={
                <ThemeIcon 
                  color={task.completed ? "green" : "gray"} 
                  variant={task.completed ? "filled" : "light"}
                  size={isSmall ? 24 : 28}
                  radius="xl"
                >
                  {task.completed 
                    ? <IconCircleCheck size={isSmall ? 16 : 18} /> 
                    : <IconCircleDashed size={isSmall ? 16 : 18} />
                  }
                </ThemeIcon>
              }
            >
              <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
                <Text 
                  style={{ 
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.7 : 1
                  }}
                >
                  {task.label}
                </Text>
                
                {!task.completed && (
                  <Button
                    variant="light"
                    size={isSmall ? "xs" : "sm"}
                    px={isSmall ? 8 : undefined}
                    onClick={task.action}
                  >
                    {task.actionLabel}
                  </Button>
                )}
              </Group>
            </List.Item>
          ))}
        </List>
        
        {!allTasksCompleted && nextTask && (
          <Button 
            onClick={nextTask.action}
            rightSection={<IconArrowRight size={isSmall ? 14 : 16} />}
            mt={isSmall ? "xs" : "md"}
            fullWidth
          >
            {nextTask.actionLabel}
          </Button>
        )}
        
        {allTasksCompleted && (
          <Button 
            color="green"
            onClick={() => navigate({ to: '/dashboard', search: { tab: 'jobdesc' } })}
            mt={isSmall ? "xs" : "md"}
            rightSection={<IconArrowRight size={isSmall ? 14 : 16} />}
            fullWidth
          >
            Analyze Job Match
          </Button>
        )}
      </Stack>
    </Paper>
  );
} 