import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
  ScrollArea,
  Center,
  Loader,
  ThemeIcon,
  rem,
  Checkbox,
  Box,
  Grid
} from '@mantine/core';
import { StorageService } from '../../services/storageService';
import type { AnalysisResult } from '../../services/storageService'; // Import the type
import { IconArrowBack, IconInfoCircle, IconGitCompare, IconCalendar, IconBriefcase } from '@tabler/icons-react';

export const Route = createFileRoute('/history/')({
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimestamps, setSelectedTimestamps] = useState<string[]>([]);
  const [compareButtonVisible, setCompareButtonVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    try {
      const loadedHistory = StorageService.getAnalysisHistory();
      setHistory(loadedHistory);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      // Handle error display if needed
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCompareButtonVisible(selectedTimestamps.length >= 2);
  }, [selectedTimestamps]);

  const handleSelectionChange = (timestamp: string | undefined, checked: boolean) => {
    if (!timestamp) return;
    setSelectedTimestamps((prev) =>
      checked ? [...prev, timestamp] : prev.filter((ts) => ts !== timestamp)
    );
  };

  const handleCompare = () => {
    if (selectedTimestamps.length < 2) return;
    navigate({
      to: '/compare',
      search: { analyses: selectedTimestamps },
    });
  };

  const formatDate = (timestamp: string | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      });
    } catch (e) {
      return timestamp; // Return raw string if parsing fails
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  // Function to truncate job description
  const truncateText = (text: string | undefined, maxLength: number = 100): string => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Container size="lg" py="xl" px="md">
      <Stack gap="xl">
        {/* Header Area */}
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
                <Text fw={500} tt="uppercase" fz="sm" c="dimmed">Analysis History</Text>
                <Title order={2} size="h3" fw={700}>Previous Resume Analyses</Title>
                <Text size="md" c="dimmed" maw={600}>
                  Review your past job analysis results and compare different job applications
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                leftSection={<IconArrowBack size={18} />}
                onClick={() => navigate({ to: '/dashboard' })}
                variant="light"
                size="md"
                radius="md"
              >
                Back to Dashboard
              </Button>
            </Grid.Col>
          </Grid>
        </Box>

        {compareButtonVisible && (
          <Card withBorder shadow="sm" radius="lg" p="md">
            <Group justify="space-between" align="center">
              <Text fw={500}>
                {selectedTimestamps.length} analyses selected
              </Text>
              <Button
                size="md"
                leftSection={<IconGitCompare size={18} />}
                onClick={handleCompare}
                disabled={selectedTimestamps.length < 2}
                radius="md"
              >
                Compare Selected Analyses
              </Button>
            </Group>
          </Card>
        )}

        {isLoading ? (
          <Center style={{ height: rem(300) }}>
            <Loader size="lg" />
          </Center>
        ) : history.length === 0 ? (
          <Card withBorder p="xl" radius="lg" shadow="sm">
            <Center style={{ padding: rem(40) }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={rem(80)} radius="xl" variant="light" color="blue">
                   <IconInfoCircle style={{ width: rem(40), height: rem(40) }} />
                </ThemeIcon>
                <Title order={3} ta="center" fw={600}>No History Found</Title>
                <Text ta="center" size="md" c="dimmed" maw={500}>
                  You haven't performed any resume analyses yet. Head back to the dashboard 
                  to analyze your resume against a job description.
                </Text>
                <Button 
                  mt="md" 
                  onClick={() => navigate({ to: '/dashboard' })}
                  size="md"
                  radius="md"
                >
                  Return to Dashboard
                </Button>
              </Stack>
            </Center>
          </Card>
        ) : (
          <ScrollArea style={{ height: `calc(100vh - ${compareButtonVisible ? 340 : 280}px)` }} type="auto">
            <Stack gap="md">
              {history.map((item, index) => (
                <Card key={item.timestamp || index} withBorder shadow="sm" p="lg" radius="md">
                  <Grid>
                    <Grid.Col span="auto" style={{ maxWidth: rem(40) }}>
                      <Checkbox
                        size="md"
                        radius="sm"
                        checked={selectedTimestamps.includes(item.timestamp || '')}
                        onChange={(event) => handleSelectionChange(item.timestamp, event.currentTarget.checked)}
                        aria-label={`Select analysis from ${formatDate(item.timestamp)}`}
                      />
                    </Grid.Col>
                    <Grid.Col span="auto" style={{ flex: 1 }}>
                      <Stack gap="md">
                        <Grid align="center">
                          <Grid.Col span={{ base: 12, sm: 8 }}>
                            <Group gap="xs" mb={5}>
                              <ThemeIcon size="md" variant="light" radius="xl" color="gray">
                                <IconCalendar size={14} />
                              </ThemeIcon>
                              <Text size="sm" c="dimmed">
                                {formatDate(item.timestamp)}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <ThemeIcon size="md" variant="light" radius="xl" color="blue">
                                <IconBriefcase size={14} />
                              </ThemeIcon>
                              <Text fw={600} size="md" lineClamp={2}>
                                {truncateText(item.jobDescription, 120)}
                              </Text>
                            </Group>
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Group justify="flex-end" gap="lg">
                              <Stack gap={0} align="center">
                                <Text size="xs" c="dimmed">Overall</Text>
                                <Badge 
                                  color={getScoreColor(item.overallMatch)} 
                                  size="lg" 
                                  radius="sm"
                                  variant="filled"
                                >
                                  {item.overallMatch}%
                                </Badge>
                              </Stack>
                              <Stack gap={0} align="center">
                                <Text size="xs" c="dimmed">Skills</Text>
                                <Badge 
                                  color="blue" 
                                  size="lg" 
                                  radius="sm"
                                  variant="outline"
                                >
                                  {item.skillsMatch}%
                                </Badge>
                              </Stack>
                              <Stack gap={0} align="center" visibleFrom="sm">
                                <Text size="xs" c="dimmed">Experience</Text>
                                <Badge 
                                  color="violet" 
                                  size="lg" 
                                  radius="sm"
                                  variant="outline"
                                >
                                  {item.experienceMatch}%
                                </Badge>
                              </Stack>
                            </Group>
                          </Grid.Col>
                        </Grid>
                        
                        <Grid hiddenFrom="xs">
                          <Grid.Col span={12}>
                            <Group justify="center" gap="lg">
                              <Stack gap={0} align="center" visibleFrom="xs" hiddenFrom="sm">
                                <Text size="xs" c="dimmed">Experience</Text>
                                <Badge 
                                  color="violet" 
                                  size="lg" 
                                  radius="sm"
                                  variant="outline"
                                >
                                  {item.experienceMatch}%
                                </Badge>
                              </Stack>
                            </Group>
                          </Grid.Col>
                        </Grid>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
} 