import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
  Grid,
  Center,
  Loader,
  ThemeIcon,
  rem,
  Alert,
  Divider,
  Box,
  Paper
} from '@mantine/core';
import { StorageService } from '../../services/storageService';
import type { AnalysisResult } from '../../services/storageService';
import { IconArrowBack, IconAlertTriangle, IconListCheck, IconBulb, IconGitCompare } from '@tabler/icons-react';

// Define the expected search parameters
interface CompareSearch {
  analyses: string[];
}

export const Route = createFileRoute('/compare/')({
  component: ComparePage,
  validateSearch: (search: Record<string, unknown>): CompareSearch => {
    // Basic validation - ensure 'analyses' is an array of strings
    if (
      !search ||
      typeof search !== 'object' ||
      !search.analyses ||
      !Array.isArray(search.analyses) ||
      !search.analyses.every(item => typeof item === 'string')
    ) {
      // Redirect or throw? For now, default to empty array.
      // In a real app, redirecting back might be better.
      return { analyses: [] };
    }
    // Create a new object with the correct type structure
    return { analyses: search.analyses as string[] };
  },
});

function ComparePage() {
  const navigate = useNavigate();
  const { analyses: selectedTimestamps } = useSearch({ from: Route.id });
  const [comparisonData, setComparisonData] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      if (!selectedTimestamps || selectedTimestamps.length < 2) {
        throw new Error('At least two analyses must be selected for comparison.');
      }
      const allHistory = StorageService.getAnalysisHistory();
      const selectedAnalyses = allHistory.filter(item =>
        item.timestamp && selectedTimestamps.includes(item.timestamp)
      );

      if (selectedAnalyses.length !== selectedTimestamps.length) {
         console.warn('Some selected analyses were not found in history.');
         // Potentially filter selectedTimestamps based on found analyses?
      }

      if (selectedAnalyses.length < 2) {
         throw new Error('Could not find at least two selected analyses in history.');
      }

      setComparisonData(selectedAnalyses);
    } catch (err) {
      console.error('Error loading comparison data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimestamps]); // Depend on the search parameters

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const formatDate = (timestamp: string | undefined): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString(); // Simpler date format
  };

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
                <Text fw={500} tt="uppercase" fz="sm" c="dimmed">Comparison</Text>
                <Title order={2} size="h3" fw={700}>Resume Analysis Comparison</Title>
                <Text size="md" c="dimmed" maw={600}>
                  Compare multiple job analysis results side by side
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                leftSection={<IconArrowBack size={18} />}
                onClick={() => navigate({ to: '/history' })}
                variant="light"
                size="md"
                radius="md"
              >
                Back to History
              </Button>
            </Grid.Col>
          </Grid>
        </Box>

        {isLoading ? (
          <Center style={{ height: rem(300) }}>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text c="dimmed">Loading comparison data...</Text>
            </Stack>
          </Center>
        ) : error ? (
          <Alert 
            color="red" 
            title="Error" 
            icon={<IconAlertTriangle size={18} />}
            radius="md"
            styles={{
              root: {
                border: '1px solid',
                borderColor: '#ffcdd2'
              }
            }}
          >
            {error}
          </Alert>
        ) : (
          <Card withBorder p={0} radius="lg" shadow="sm">
            <Box p="md" mb="xs">
              <Group mb="lg">
                <ThemeIcon size={42} radius="md" variant="light" color="primary">
                  <IconGitCompare size={24} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Title order={3} size="h4">Comparison Results</Title>
                  <Text size="sm" c="dimmed">Side by side analysis of different job applications</Text>
                </Stack>
              </Group>
              
              <Grid gutter="md">
                {comparisonData.map((item, index) => (
                  <Grid.Col span={{ base: 12, sm: 6, md: 12 / comparisonData.length }} key={item.timestamp || index}>
                    <Paper withBorder p="md" radius="md" style={{ height: '100%' }} shadow="xs">
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Badge variant="light" size="lg" radius="sm">{formatDate(item.timestamp)}</Badge>
                          <Badge 
                            size="lg" 
                            color={getScoreColor(item.overallMatch)}
                            radius="sm"
                            variant="filled"
                          >
                            {item.overallMatch}%
                          </Badge>
                        </Group>
                        <Text fw={600} size="md" lineClamp={2}>{item.jobDescription || 'N/A'}</Text>

                        <Divider label="Scores" labelPosition="center" />
                        <Group justify="space-around" mt="xs">
                          <Stack align="center" gap={0}>
                            <Text size="xs" c="dimmed">Overall</Text>
                            <Badge size="lg" color={getScoreColor(item.overallMatch)}>{item.overallMatch}%</Badge>
                          </Stack>
                          <Stack align="center" gap={0}>
                            <Text size="xs" c="dimmed">Skills</Text>
                            <Badge size="lg" color="blue">{item.skillsMatch}%</Badge>
                          </Stack>
                          <Stack align="center" gap={0}>
                            <Text size="xs" c="dimmed">Experience</Text>
                            <Badge size="lg" color="violet">{item.experienceMatch}%</Badge>
                          </Stack>
                        </Group>

                        <Divider label="Recommendations" labelPosition="center" />
                        <Stack gap="xs">
                          {item.recommendations.slice(0, 3).map((rec, i) => (
                            <Group key={i} gap="xs" wrap="nowrap">
                              <ThemeIcon size="sm" color="green" variant="light"><IconBulb size={12} /></ThemeIcon>
                              <Text size="xs" lineClamp={2}>{rec}</Text>
                            </Group>
                          ))}
                          {item.recommendations.length === 0 && <Text size="xs" c="dimmed">None</Text>}
                        </Stack>

                        <Divider label="Missing Skills" labelPosition="center" />
                        <Stack gap="xs">
                          {item.missingSkills.slice(0, 3).map((skill, i) => (
                            <Group key={i} gap="xs" wrap="nowrap">
                              <ThemeIcon size="sm" color="orange" variant="light"><IconListCheck size={12} /></ThemeIcon>
                              <Text size="xs" lineClamp={2}>{skill}</Text>
                            </Group>
                          ))}
                          {item.missingSkills.length === 0 && <Text size="xs" c="dimmed">None</Text>}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          </Card>
        )}
      </Stack>
    </Container>
  );
}