import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  ThemeIcon,
  Button,
  Group,
  Paper,
  List,
  rem
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowBack,
  IconRefresh,
  IconHomeExclamation,
  IconArrowBackUp,
  IconTrash
} from '@tabler/icons-react';

// Error types with corresponding recovery actions
export type ErrorType =
  | 'api'
  | 'storage'
  | 'file'
  | 'network'
  | 'permission'
  | 'validation'
  | 'notFound'
  | 'generic';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onBack?: () => void;
  onReset?: () => void;
  onClearData?: () => void;
  onNavigateHome?: () => void;
  additionalActions?: React.ReactNode;
}

export function ErrorDisplay({
  title,
  message,
  type = 'generic',
  onRetry,
  onBack,
  onReset,
  onClearData,
  onNavigateHome,
  additionalActions
}: ErrorDisplayProps) {
  // Default title based on error type
  const defaultTitle = {
    api: 'API Error',
    storage: 'Storage Error',
    file: 'File Error',
    network: 'Network Error',
    permission: 'Permission Error',
    validation: 'Validation Error',
    notFound: 'Not Found',
    generic: 'Something Went Wrong'
  }[type];

  // Recovery suggestions based on error type
  const recoverySuggestions = {
    api: [
      'Check your API key to ensure it is valid',
      'The service might be experiencing temporary issues',
      'Try again in a few moments'
    ],
    storage: [
      'Your browser storage might be full',
      'Try clearing some space or using private browsing',
      'Check if you have storage permissions enabled'
    ],
    file: [
      'Make sure your file is not corrupted',
      'Check that the file format is supported (.pdf)',
      'Try uploading a smaller file if the current one is large'
    ],
    network: [
      'Check your internet connection',
      'The server might be temporarily unavailable',
      'Try again in a few moments'
    ],
    permission: [
      'The app needs certain permissions to function correctly',
      'Try refreshing and accepting any permission prompts',
      'Check your browser settings for blocked permissions'
    ],
    validation: [
      'Some required information is missing or invalid',
      'Check your inputs and try again',
      'Make sure all required fields are filled in'
    ],
    notFound: [
      'The resource you requested doesn\'t exist',
      'It might have been moved or deleted',
      'Try navigating back to the dashboard'
    ],
    generic: [
      'This is an unexpected error',
      'Try refreshing the page',
      'If the problem persists, try clearing your browser cache'
    ]
  }[type];

  // Background color based on error type
  const bgColor = {
    api: 'linear-gradient(135deg, #fff4f4 0%, #ffecec 100%)',
    storage: 'linear-gradient(135deg, #fff4f4 0%, #ffecec 100%)',
    file: 'linear-gradient(135deg, #fff8ec 0%, #fff3d6 100%)',
    network: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
    permission: 'linear-gradient(135deg, #fff4f4 0%, #ffecec 100%)',
    validation: 'linear-gradient(135deg, #fff8ec 0%, #fff3d6 100%)',
    notFound: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
    generic: 'linear-gradient(135deg, #f6f6f6 0%, #ececec 100%)'
  }[type];

  // Icon color based on error type
  const iconColor = {
    api: 'red',
    storage: 'red',
    file: 'orange',
    network: 'blue',
    permission: 'red',
    validation: 'orange',
    notFound: 'blue',
    generic: 'gray'
  }[type];

  return (
    <Container size="lg" py="xl">
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{
          background: bgColor,
          borderLeft: `4px solid var(--mantine-color-${iconColor}-6)`
        }}
      >
        <Stack gap="lg">
          <Group justify="center">
            <ThemeIcon size={rem(80)} radius="xl" color={iconColor} variant="light">
              <IconAlertCircle size={rem(40)} />
            </ThemeIcon>
          </Group>

          <Stack gap="sm" align="center">
            <Title order={2} ta="center">
              {title || defaultTitle}
            </Title>
            <Text size="lg" ta="center" fw={500}>
              {message}
            </Text>
          </Stack>

          {recoverySuggestions.length > 0 && (
            <Box>
              <Text fw={500} mb="xs">Suggestions to try:</Text>
              <List withPadding>
                {recoverySuggestions.map((suggestion, index) => (
                  <List.Item key={index}>
                    <Text size="sm">{suggestion}</Text>
                  </List.Item>
                ))}
              </List>
            </Box>
          )}

          <Stack gap="md" mt="xl" w="100%">
            {onBack && (
              <Button
                leftSection={<IconArrowBack size={rem(16)} />}
                variant="outline"
                onClick={onBack}
                size="md"
                fullWidth
                styles={{
                  root: {
                    borderColor: '#dee2e6',
                    height: '50px'
                  }
                }}
              >
                Go Back
              </Button>
            )}

            {onRetry && (
              <Button
                leftSection={<IconRefresh size={rem(16)} />}
                color="blue"
                onClick={onRetry}
                size="md"
                fullWidth
                styles={{
                  root: {
                    height: '50px'
                  }
                }}
              >
                Try Again
              </Button>
            )}

            {onNavigateHome && (
              <Button
                leftSection={<IconHomeExclamation size={rem(16)} />}
                variant="filled"
                color="blue"
                onClick={onNavigateHome}
                size="md"
                fullWidth
                styles={{
                  root: {
                    height: '50px'
                  }
                }}
              >
                Go to Dashboard
              </Button>
            )}

            {onReset && (
              <Button
                leftSection={<IconArrowBackUp size={rem(16)} />}
                variant="subtle"
                color="gray"
                onClick={onReset}
                size="md"
                fullWidth
              >
                Reset
              </Button>
            )}

            {onClearData && (
              <Button
                leftSection={<IconTrash size={rem(16)} />}
                variant="subtle"
                color="red"
                onClick={onClearData}
                size="md"
                fullWidth
              >
                Clear Data
              </Button>
            )}

            {additionalActions}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
} 