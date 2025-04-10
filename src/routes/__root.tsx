import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { theme } from '../theme'
import { useEffect, useState } from 'react'
import { LoadingScreen } from '../components/LoadingScreen'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  const routerState = useRouterState()
  const [isLoading, setIsLoading] = useState(false)
  
  // Track loading state changes for route transitions
  useEffect(() => {
    // Update loading state based on router state
    setIsLoading(routerState.status === 'pending')
  }, [routerState.status])
  
  // Check if the app is initially loading (first render)
  const isInitialMount = routerState.status === 'pending' && routerState.location.pathname === window.location.pathname
  
  // Add global keyframes style if needed
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('global-animations')) {
      const style = document.createElement('style');
      style.id = 'global-animations';
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  return (
    <MantineProvider theme={theme}>
      {/* Global loading overlay for route transitions */}
      {isLoading && !isInitialMount && (
        <LoadingScreen 
          variant="overlay" 
          text="Loading page..."
          withLogo={false}
        />
      )}
      
      {/* Initial app loading screen */}
      {isInitialMount ? (
        <LoadingScreen 
          variant="fullscreen" 
          text="Loading application..." 
          withLogo={true}
        />
      ) : (
        <Outlet />
      )}
      <TanStackRouterDevtools />
    </MantineProvider>
  )
}
