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
  Box
} from '@mantine/core';
import { StorageService } from '../../services/storageService';
import type { AnalysisResult } from '../../services/storageService'; // Import the type
import { IconArrowBack, IconInfoCircle, IconGitCompare } from '@tabler/icons-react';

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
    <Container size="md" py="md" px="xs">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} size="h3">Analysis History</Title>
          <Button
            leftSection={<IconArrowBack size={16} />}
            onClick={() => navigate({ to: '/dashboard' })}
            variant="light"
            size="sm"
          >
            Back to Dashboard
          </Button>
        </Group>

        {compareButtonVisible && (
          <Box mb="md">
            <Button
              fullWidth
              size="sm"
              leftSection={<IconGitCompare size={18} />}
              onClick={handleCompare}
              disabled={selectedTimestamps.length < 2}
            >
              Compare {selectedTimestamps.length} Selected Analyses
            </Button>
          </Box>
        )}

        {isLoading ? (
          <Center style={{ height: rem(200) }}><Loader /></Center>
        ) : history.length === 0 ? (
          <Card withBorder p="lg" radius="md">
            <Center>
              <Stack align="center">
                <ThemeIcon size="xl" radius="xl" variant="light">
                   <IconInfoCircle style={{ width: rem(24), height: rem(24) }} />
                </ThemeIcon>
                <Text ta="center" fw={500}>No history found.</Text>
                <Text ta="center" size="sm" c="dimmed">
                  Perform an analysis from the dashboard to see results here.
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <ScrollArea style={{ height: `calc(100vh - ${compareButtonVisible ? 260 : 200}px)` }} type="auto">
            <Stack gap="md">
              {history.map((item, index) => (
                <Card key={item.timestamp || index} withBorder p="md" radius="md">
                  <Group wrap="nowrap" align="flex-start">
                    <Checkbox
                      checked={selectedTimestamps.includes(item.timestamp || '')}
                      onChange={(event) => handleSelectionChange(item.timestamp, event.currentTarget.checked)}
                      aria-label={`Select analysis from ${formatDate(item.timestamp)}`}
                      mt={4}
                    />
                    <Stack gap="xs" style={{ flexGrow: 1 }}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {formatDate(item.timestamp)}
                        </Text>
                        <Badge color={getScoreColor(item.overallMatch)} variant="light">
                          Overall: {item.overallMatch}%
                        </Badge>
                      </Group>
                      <Text fw={500} size="sm" lineClamp={2}>
                        Job: {truncateText(item.jobDescription, 80)}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
} 