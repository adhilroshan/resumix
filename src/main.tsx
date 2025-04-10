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
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Add event listener for when a new service worker is waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed but waiting
                console.log('New version available! Skipping waiting...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
      
    // When a new service worker takes over, reload the page
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('New service worker controller, refreshing page...');
        window.location.reload();
      }
    });
  });
}

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: ({ match }) => {
    // This component shows during navigation
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          background: '#fff',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #1976d2',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Loading {match?.routeId || 'page'}...
          </div>
        </div>
      </div>
    )
  },
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

// Add global loading styles
document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #root:empty {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }
    #root:empty::after {
      content: '';
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #1976d2;
      animation: spin 1s linear infinite;
    }
  </style>`
);

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
