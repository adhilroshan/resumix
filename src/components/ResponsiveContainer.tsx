import type { ReactNode } from 'react';
import { Container, Box, useMantineTheme } from '@mantine/core';
import type { BoxProps, ElementProps } from '@mantine/core';

// Define styles as an object instead of using createStyles
const styles = {
  responsiveContainer: {
    paddingLeft: 'var(--mantine-spacing-md)',
    paddingRight: 'var(--mantine-spacing-md)',
  },
  
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
    paddingLeft: 0,
    paddingRight: 0,
  },
  
  narrowOnMobile: {},
  
  responsiveBox: {
    padding: 'var(--mantine-spacing-lg)',
  }
};

// Add global styles for media queries
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @media (max-width: 768px) {
      .responsive-container {
        padding-left: var(--mantine-spacing-sm);
        padding-right: var(--mantine-spacing-sm);
      }
      
      .narrow-on-mobile {
        padding-left: var(--mantine-spacing-xs);
        padding-right: var(--mantine-spacing-xs);
      }
      
      .responsive-box {
        padding: var(--mantine-spacing-md);
      }
    }
    
    @media (max-width: 576px) {
      .responsive-container {
        padding-left: var(--mantine-spacing-xs);
        padding-right: var(--mantine-spacing-xs);
      }
      
      .responsive-box {
        padding: var(--mantine-spacing-sm);
      }
    }
  `;
  document.head.appendChild(styleElement);
}

interface ResponsiveContainerProps extends BoxProps, ElementProps<'div', keyof BoxProps> {
  children: ReactNode;
  fullWidth?: boolean;
  narrowOnMobile?: boolean;
  className?: string;
}

/**
 * A responsive container component that adapts to different screen sizes
 */
export function ResponsiveContainer({
  children,
  fullWidth = false,
  narrowOnMobile = false,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <Container
      {...props}
      className={`
        ${styles.responsiveContainer} 
        responsive-container
        ${fullWidth ? styles.fullWidth : ''} 
        ${narrowOnMobile ? 'narrow-on-mobile' : ''}
        ${className || ''}
      `}
    >
      {children}
    </Container>
  );
}

interface ResponsiveBoxProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * A responsive box component with adaptive padding
 */
export function ResponsiveBox({ children, className, ...props }: ResponsiveBoxProps) {
  return (
    <Box className={`${styles.responsiveBox} responsive-box ${className || ''}`} {...props}>
      {children}
    </Box>
  );
}

/**
 * Utility hook for getting responsive sizes
 */
export function useResponsiveSizes() {
  const theme = useMantineTheme();
  
  const isScreenSmaller = (breakpoint: string) => 
    typeof window !== 'undefined' && window.innerWidth < Number(theme.breakpoints[breakpoint as keyof typeof theme.breakpoints].replace('px', ''));
  
  return {
    isExtraSmall: isScreenSmaller('xs'),
    isSmall: isScreenSmaller('sm'),
    isMedium: isScreenSmaller('md'),
    isLarge: isScreenSmaller('lg'),
    isExtraLarge: isScreenSmaller('xl'),
    
    // Responsive size values
    padding: {
      xs: isScreenSmaller('sm') ? theme.spacing.xs : theme.spacing.sm,
      sm: isScreenSmaller('sm') ? theme.spacing.sm : theme.spacing.md,
      md: isScreenSmaller('sm') ? theme.spacing.md : theme.spacing.lg,
      lg: isScreenSmaller('sm') ? theme.spacing.lg : theme.spacing.xl,
    },
    
    fontSize: {
      small: isScreenSmaller('sm') ? theme.fontSizes.xs : theme.fontSizes.sm,
      medium: isScreenSmaller('sm') ? theme.fontSizes.sm : theme.fontSizes.md,
      large: isScreenSmaller('sm') ? theme.fontSizes.md : theme.fontSizes.lg,
    },
  };
} 