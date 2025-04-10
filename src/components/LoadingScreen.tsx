import { Box, Center, Loader, Text, Stack, Paper } from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';
import type { CSSProperties } from 'react';

// Define CSS animation directly instead of using keyframes import
const pulseAnimation = {
  animation: 'pulse 1.5s ease-in-out infinite'
};

// Create simpler styles object without theme dependencies
const styles: Record<string, CSSProperties> = {
  loadingContainer: {
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  pulseAnimation,
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(3px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingBox: {
    background: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  }
};

// Add CSS keyframes rule to the document
if (typeof document !== 'undefined') {
  // Only run in browser environment
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

interface LoadingScreenProps {
  variant?: 'fullscreen' | 'overlay' | 'inline' | 'minimal';
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withLogo?: boolean;
  fixed?: boolean;
}

export function LoadingScreen({ 
  variant = 'fullscreen',
  text = 'Loading...',
  size = 'xl',
  withLogo = false,
  fixed = false
}: LoadingScreenProps) {
  // Create dynamic styles that depend on props
  const dynamicStyles: Record<string, CSSProperties> = {
    fullscreenContainer: {
      ...styles.loadingContainer,
      position: fixed ? 'fixed' : 'absolute',
      zIndex: fixed ? 9999 : 'auto' as any,
    }
  };

  if (variant === 'minimal') {
    return (
      <Center>
        <Loader size={size} />
      </Center>
    );
  }

  if (variant === 'inline') {
    return (
      <Box p="md">
        <Center>
          <Stack gap="xs" align="center">
            <Loader size={size} />
            {text && (
              <Text size="sm" c="dimmed" style={styles.pulseAnimation}>
                {text}
              </Text>
            )}
          </Stack>
        </Center>
      </Box>
    );
  }

  if (variant === 'overlay') {
    return (
      <Box style={styles.overlay}>
        <Paper shadow="md" style={styles.loadingBox}>
          <Stack gap="md" align="center">
            {withLogo && (
              <Box mb="md">
                <IconRocket size={40} stroke={1.5} />
              </Box>
            )}
            <Loader size={size} />
            {text && (
              <Text size="sm" c="dimmed" style={styles.pulseAnimation}>
                {text}
              </Text>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Default fullscreen variant
  return (
    <Box style={dynamicStyles.fullscreenContainer}>
      <Stack gap="xl" align="center">
        {withLogo && (
          <Box mb="md" style={styles.pulseAnimation}>
            <IconRocket size={60} stroke={1.5} color="#1c7ed6" />
          </Box>
        )}
        <Paper shadow="md" style={styles.loadingBox}>
          <Stack gap="md" align="center">
            <Loader size={size} />
            {text && (
              <Text size="md" fw={500} style={styles.pulseAnimation}>
                {text}
              </Text>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
} 