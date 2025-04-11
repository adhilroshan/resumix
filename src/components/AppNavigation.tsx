// import { useState } from 'react';
import { 
  AppShell, 
  Text, 
  useMantineTheme, 
  Group, 
  Stack,
  ThemeIcon,
  Box,
  Divider,
  NavLink as MantineNavLink,
  Avatar,
  Tooltip,
  rem
} from '@mantine/core';
import { 
  IconHome, 
  IconHistory, 
  IconUser, 
  IconSettings,
  IconFileAnalytics,
  IconLogout,
  IconBrandGithub
} from '@tabler/icons-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useResponsiveSizes } from './ResponsiveContainer';
import { StorageService } from '../services/storageService';

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

export function AppNavigation({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  // const [opened, setOpened] = useState(false);
  const routerState = useRouterState();
  const navigate = useNavigate();
  const responsiveSizes = useResponsiveSizes();
  const isSmall = responsiveSizes.isSmall;
  
  
  // Get user information for profile display
  const userInfo = StorageService.getUserInformation();
  const userName = userInfo?.fullName || 'User';
  const userEmail = userInfo?.email || 'user@example.com';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Get the current route path for highlighting active item
  const currentPath = routerState?.location?.pathname || '/';
  
  // Navigation items for both mobile and desktop
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: <IconHome size={isSmall ? 18 : 20} />,
      path: '/',
      description: 'Upload resume and analyze jobs'
    },
    {
      label: 'Analysis',
      icon: <IconFileAnalytics size={isSmall ? 18 : 20} />,
      path: '/analysis',
      description: 'View latest analysis'
    },
    {
      label: 'History',
      icon: <IconHistory size={isSmall ? 18 : 20} />,
      path: '/history',
      description: 'Past analyses and results'
    },
    {
      label: 'Profile',
      icon: <IconUser size={isSmall ? 18 : 20} />,
      path: '/profile',
      description: 'Your information and settings'
    }
  ];
  
  // Mobile bottom navigation
  const renderMobileNav = () => (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        background: theme.white,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        padding: isSmall ? `${theme.spacing.xs}` : `${theme.spacing.sm}`,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
      }}
      hiddenFrom="md"
    >
      {navigationItems.map((item) => (
        <Box
          key={item.path}
          component="button"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: currentPath === item.path ? theme.colors.blue[6] : theme.colors.gray[6],
            width: isSmall ? rem(65) : rem(72),
            padding: isSmall ? theme.spacing.xs : theme.spacing.sm,
            minHeight: isSmall ? rem(42) : rem(50),
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          onClick={() => navigate({ to: item.path })}
        >
          {item.icon}
          <Text size={isSmall ? "xs" : "sm"} mt={4} fw={currentPath === item.path ? 500 : 400}>
            {item.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
  
  return (
    <AppShell
      header={{ height: isSmall ? 50 : 60 }}
      navbar={{
        width: 250,
        breakpoint: 'md',
        collapsed: { mobile: true }, // Always collapse on mobile
      }}
      padding={isSmall ? "xs" : "md"}
    >
      <AppShell.Header p={isSmall ? "xs" : "md"}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          justifyContent: 'space-between' 
        }}>
          <Text fw={700} size={isSmall ? "md" : "lg"}>Resumix</Text>
          
          <Group justify="flex-end">
            <Tooltip label="View on GitHub">
              <ThemeIcon variant="light" radius="xl" size={isSmall ? "sm" : "md"}>
                <IconBrandGithub size={isSmall ? 14 : 18} />
              </ThemeIcon>
            </Tooltip>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar p="md" visibleFrom="md">
        <AppShell.Section>
          <Group mb="md">
            <ThemeIcon radius="xl" size="lg" color="blue">
              <IconFileAnalytics size={20} />
            </ThemeIcon>
            <Text fw={700} size="xl">Resumix</Text>
          </Group>
          <Divider mb="md" />
        </AppShell.Section>
        
        <AppShell.Section grow>
          <Stack gap="xs">
            {navigationItems.map((item) => (
              <MantineNavLink
                key={item.path}
                label={item.label}
                leftSection={item.icon}
                active={currentPath === item.path}
                onClick={() => {
                  navigate({ to: item.path });
                  // setOpened(false);
                }}
                description={item.description}
              />
            ))}
          </Stack>
        </AppShell.Section>
        
        <AppShell.Section>
          <Divider my="md" />
          <Group justify="space-between">
            <Group>
              <Avatar radius="xl" size="sm" color="blue">{userInitials}</Avatar>
              <Box>
                <Text size="sm" fw={500}>{userName}</Text>
                <Text size="xs" c="dimmed">{userEmail}</Text>
              </Box>
            </Group>
            <Group>
              <Tooltip label="Settings">
                <ThemeIcon 
                  variant="light" 
                  radius="xl"
                  onClick={() => navigate({ to: '/profile' })}
                  style={{ cursor: 'pointer' }}
                >
                  <IconSettings size={18} />
                </ThemeIcon>
              </Tooltip>
              <Tooltip label="Logout">
                <ThemeIcon variant="light" radius="xl">
                  <IconLogout size={18} />
                </ThemeIcon>
              </Tooltip>
            </Group>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main 
        style={{ 
          backgroundColor: theme.colors.gray[0],
          paddingBottom: isSmall ? rem(60) : rem(70), // Add padding for mobile nav
        }}
      >
        {children}
        {renderMobileNav()}
      </AppShell.Main>
    </AppShell>
  );
} 