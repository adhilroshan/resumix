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
  Divider
} from '@mantine/core';
import { StorageService } from '../../services/storageService';
import type { AnalysisResult } from '../../services/storageService';
import { IconArrowBack, IconAlertTriangle, IconListCheck, IconBulb } from '@tabler/icons-react';

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
    <Container size="lg" py="md" px="xs"> {/* Use larger container */}
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} size="h3">Comparison</Title>
          <Button
            leftSection={<IconArrowBack size={16} />}
            onClick={() => navigate({ to: '/history' })}
            variant="light"
            size="sm"
          >
            Back to History
          </Button>
        </Group>

        {isLoading ? (
          <Center style={{ height: rem(200) }}><Loader /></Center>
        ) : error ? (
          <Alert color="red" title="Error" icon={<IconAlertTriangle size={18} />}>
            {error}
          </Alert>
        ) : (
          <Grid gutter="md">
            {comparisonData.map((item, index) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 12 / comparisonData.length }} key={item.timestamp || index}>
                <Card withBorder p="md" radius="md" style={{ height: '100%' }}>
                  <Stack gap="md">
                    <Badge variant="light" size="sm">{formatDate(item.timestamp)}</Badge>
                    <Text size="sm" lineClamp={3} fw={500}>Job: {item.jobDescription || 'N/A'}</Text>

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
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}