import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Center, Loader, Text, Stack } from '@mantine/core';

interface AsyncContentLoaderProps {
  children: ReactNode;
  delay?: number;
  loadingText?: string;
  minHeight?: number | string;
  priority?: 'low' | 'high';
}

/**
 * AsyncContentLoader - Helps with loading heavy content asynchronously
 * 
 * This component allows heavy content to be deferred using requestIdleCallback
 * or setTimeout, helping to prioritize the initial UI rendering.
 */
export function AsyncContentLoader({ 
  children, 
  delay = 100, 
  loadingText = 'Loading content...', 
  minHeight = 200,
  priority = 'low'
}: AsyncContentLoaderProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let timeoutId: number | null = null;
    
    if (priority === 'low' && 'requestIdleCallback' in window) {
      // Use requestIdleCallback for low priority content
      // This will load content when the browser is idle
      const idleCallbackId = window.requestIdleCallback(() => {
        timeoutId = window.setTimeout(() => setShowContent(true), delay);
      });
      
      return () => {
        if (idleCallbackId) window.cancelIdleCallback(idleCallbackId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    } else {
      // Use setTimeout for high priority content or if requestIdleCallback is not available
      timeoutId = window.setTimeout(() => setShowContent(true), delay);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [delay, priority]);

  if (!showContent) {
    return (
      <Box p="md" style={{ minHeight }}>
        <Center>
          <Stack gap="xs" align="center">
            <Loader size="md" />
            {loadingText && (
              <Text size="sm" c="dimmed">
                {loadingText}
              </Text>
            )}
          </Stack>
        </Center>
      </Box>
    );
  }

  return <>{children}</>;
}

// Extend Window interface without redefining built-in properties
declare global {
  interface Window {
    // Use same type signature as the DOM lib
    requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number;
    cancelIdleCallback(handle: number): void;
  }
} 