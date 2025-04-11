import { memo, useMemo } from 'react';
import { 
  Text, 
  Stack, 
  Card, 
  Group, 
  Badge,
  ThemeIcon,
  Progress,
  Box,
  Divider,
  Paper,
  Tabs,
  RingProgress,
  Title
} from '@mantine/core';
import { 
  IconCheck,
  IconChartRadar,
  IconChartBar,
  IconBulb,
  IconTrophy,
  IconInfoCircle,
} from '@tabler/icons-react';
import { StorageService } from '../services/storageService';
import type { AnalysisResult } from '../services/storageService';
import { Transition } from '@mantine/core';

// Helper components for the analysis result card
import { SkillsRadarChart } from './SkillsRadarChart';
import { CategorizedRecommendations } from './CategorizedRecommendations';

// Helper function to get color based on score
const getScoreColor = (score: number) => {
  if (score >= 75) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
};

// Memoized analysis result card to prevent unnecessary re-renders
export const AnalysisResultCard = memo(({ result }: { result: AnalysisResult }) => {
  // Memoize the color calculations to avoid recalculating on every render
  const colors = useMemo(() => {
    return {
      overall: getScoreColor(result.overallMatch),
      skills: getScoreColor(result.skillsMatch),
      experience: getScoreColor(result.experienceMatch)
    };
  }, [result.overallMatch, result.skillsMatch, result.experienceMatch]);

  // Get present skills
  const presentSkills = useMemo(() => {
    // Simple heuristic: if they aren't in missing skills, they're present
    return result.missingSkills ? 
      StorageService.getUserSkills().filter(skill => !result.missingSkills.includes(skill)) : 
      StorageService.getUserSkills();
  }, [result.missingSkills]);

  return (
    <Card 
      shadow="sm" 
      p={{ base: 'md', sm: 'xl' }}
      radius="lg" 
      withBorder
      className="modern-card"
      style={{ 
        transition: 'all 0.3s ease',
        overflow: 'visible'
      }}
    >
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={0} style={{ flexGrow: 1, maxWidth: '100%' }}>
            <Text fw={600} fz="sm" c="dimmed" tt="uppercase">Overall Match</Text>
            <Group align="center" mt="xs" gap="xs" wrap="wrap">
              <Box style={{ 
                animation: 'fadeIn 0.5s ease-in-out',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4px',
              }}>
                <RingProgress
                  sections={[{ value: result.overallMatch, color: colors.overall }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {Math.round(result.overallMatch)}%
                    </Text>
                  }
                  size={120}
                  thickness={12}
                  roundCaps
                />
              </Box>
              <Stack 
                gap={5} 
                ml={{ base: 0, sm: 'sm' }} 
                styles={{ 
                  root: { 
                    flexGrow: 1,
                    maxWidth: '100%',
                    '@media (min-width: 768px)': {
                      maxWidth: 'calc(100% - 140px)'
                    }
                  }
                }}
              >
                <Text fw={600} size="sm">Match Assessment</Text>
                <Badge 
                  size="lg" 
                  color={colors.overall}
                  leftSection={
                    <ThemeIcon variant="filled" color={colors.overall} radius="xl" size={22}>
                      {result.overallMatch >= 70 ? 
                        <IconTrophy size={14} /> : 
                        result.overallMatch >= 50 ? 
                        <IconCheck size={14} /> : 
                        <IconInfoCircle size={14} />}
                    </ThemeIcon>
                  }
                  styles={{ 
                    root: { 
                      animation: 'fadeIn 0.5s ease-in-out 0.2s both',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }
                  }}
                >
                  {result.overallMatch >= 75 ? 'EXCELLENT MATCH' : 
                    result.overallMatch >= 60 ? 'GOOD MATCH' : 
                    result.overallMatch >= 40 ? 'AVERAGE MATCH' : 'NEEDS IMPROVEMENT'}
                </Badge>
                <Text 
                  size="sm" 
                  color="dimmed" 
                  style={{ animation: 'fadeIn 0.5s ease-in-out 0.3s both' }}
                  styles={{ 
                    root: { 
                      maxWidth: '100%',
                      '@media (min-width: 768px)': {
                        maxWidth: '300px'
                      }
                    }
                  }}
                >
                  {result.overallMatch >= 75 ? 'Your resume is well-aligned with this position!' : 
                    result.overallMatch >= 60 ? 'Your resume matches well but could use some adjustments.' : 
                    result.overallMatch >= 40 ? 'With some improvements, your resume could be more competitive.' : 
                    'Consider making significant changes to align with this job.'}
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Group>

        <Tabs defaultValue="scores" style={{ marginTop: '1rem' }}>
          <Tabs.List mb="md" style={{ 
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <Tabs.Tab 
              value="scores" 
              leftSection={<IconChartBar size={16} />}
              style={{ fontWeight: 500 }}
              className="touch-ripple"
            >
              Match Scores
            </Tabs.Tab>
            <Tabs.Tab 
              value="skills" 
              leftSection={<IconChartRadar size={16} />}
              style={{ fontWeight: 500 }}
              className="touch-ripple"
            >
              Skills Analysis
            </Tabs.Tab>
            <Tabs.Tab 
              value="recommendations" 
              leftSection={<IconBulb size={16} />}
              style={{ fontWeight: 500 }}
              className="touch-ripple"
            >
              Recommendations
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="scores">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 12' }} className="scores-col">
                <Transition
                  mounted={true}
                  transition="slide-right"
                  duration={300}
                >
                  {(styles) => (
                    <Paper p="md" withBorder shadow="xs" radius="md" style={{...styles, overflow: 'hidden'}}>
                      <Stack gap="md">
                        <Group justify="space-between" wrap="wrap" gap="xs">
                          <Text fw={500}>Skills Match</Text>
                          <Badge size="lg" color={colors.skills} style={{ 
                            fontSize: '1rem', 
                            padding: '0.5rem 0.8rem'
                          }}>{result.skillsMatch}%</Badge>
                        </Group>
                        <Progress 
                          value={result.skillsMatch} 
                          color={colors.skills}
                          size="md"
                          radius="xl"
                          animated
                          striped
                        />
                        <Text size="sm" color="dimmed">
                          {result.skillsMatch >= 75 ? 'Your skills align very well with the job requirements.' : 
                           result.skillsMatch >= 50 ? 'Your skills match this job but there are some gaps to address.' : 
                           'Consider acquiring the missing skills to improve your match.'}
                        </Text>
                      </Stack>
                    </Paper>
                  )}
                </Transition>
              </div>
              <div style={{ gridColumn: 'span 12' }} className="scores-col">
                <Transition
                  mounted={true}
                  transition="slide-left"
                  duration={300}
                >
                  {(styles) => (
                    <Paper p="md" withBorder shadow="xs" radius="md" style={{...styles, animationDelay: '100ms', overflow: 'hidden'}}>
                      <Stack gap="md">
                        <Group justify="space-between" wrap="wrap" gap="xs">
                          <Text fw={500}>Experience Match</Text>
                          <Badge size="lg" color={colors.experience} style={{ 
                            fontSize: '1rem', 
                            padding: '0.5rem 0.8rem'
                          }}>{result.experienceMatch}%</Badge>
                        </Group>
                        <Progress 
                          value={result.experienceMatch} 
                          color={colors.experience}
                          size="md"
                          radius="xl"
                          animated
                          striped
                        />
                        <Text size="sm" color="dimmed">
                          {result.experienceMatch >= 75 ? 'Your experience level is ideal for this position.' : 
                           result.experienceMatch >= 50 ? 'Your experience is relevant but could be better highlighted.' : 
                           'Consider emphasizing relevant aspects of your experience.'}
                        </Text>
                      </Stack>
                    </Paper>
                  )}
                </Transition>
              </div>
            </div>
          </Tabs.Panel>
          
          <Tabs.Panel value="skills">
            <Paper p="md" withBorder shadow="xs" radius="md">
              <Title order={5} mb="lg">Skills Analysis</Title>
              <SkillsRadarChart 
                skills={presentSkills} 
                missingSkills={result.missingSkills} 
              />
              
              <Divider my="md" />
              
              <Box>
                <Title order={6} mb="xs">Key Missing Skills</Title>
                <Text size="sm" mb="sm" color="dimmed">
                  Consider adding these skills to your resume or acquiring them:
                </Text>
                <Group mt="md" style={{ 
                  rowGap: '10px',
                  flexWrap: 'wrap',
                  margin: '-5px',
                }}>
                  {result.missingSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      color="red"
                      variant="filled"
                      radius="sm"
                      size="lg"
                      px="md"
                      style={{
                        opacity: 0,
                        animation: `fadeIn 0.3s ease-in-out ${0.1 * index}s forwards`,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        margin: '5px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </Box>
            </Paper>
          </Tabs.Panel>
          
          <Tabs.Panel value="recommendations">
            <Paper p="md" withBorder shadow="xs" radius="md">
              <Title order={5} mb="lg">Tailored Recommendations</Title>
              <CategorizedRecommendations recommendations={result.recommendations} />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Card>
  );
}); 