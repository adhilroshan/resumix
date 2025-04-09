import { Outlet, createRootRoute } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { theme } from '../theme'

export const Route = createRootRoute({
  component: () => (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Outlet />
    </MantineProvider>
  ),
})
