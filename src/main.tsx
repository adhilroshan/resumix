import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// Import Mantine styles (these are still needed at the entry point)
import '@mantine/core/styles.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error }) => {
    console.error('Router error:', error);
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Something went wrong</h1>
        <p>An error occurred while rendering the page.</p>
        {error instanceof Error && (
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Home Page
        </button>
      </div>
    );
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Render the app
const rootElement = document.getElementById('root')
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    )
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1>Failed to start application</h1>
        <p>There was a critical error during application initialization.</p>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
          ${error instanceof Error ? error.message : String(error)}
        </pre>
        <button 
          onclick="window.location.reload()"
          style="padding: 8px 16px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Reload Page
        </button>
      </div>
    `;
  }
}

// Report web vitals
reportWebVitals()
