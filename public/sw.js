// This is the service worker for the Resume Matcher PWA

const CACHE_NAME = 'resume-matcher-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/src/assets/logo.svg',
  '/src/assets/icons/icon-192x192.png',
  '/src/assets/icons/icon-512x512.png'
];

// Install event - cache our static assets and skip waiting
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
    .then(() => {
      // Force the service worker to become active right away
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      // Tell all open pages to use this service worker immediately
      return self.clients.claim();
    })
    .then(() => {
      // Send a message to all clients that service worker has updated
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML navigation requests (e.g., page loads), use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For other GET requests, use stale-while-revalidate
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // Don't cache API requests
              if (!event.request.url.includes('/api/')) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(error => {
              console.error('[Service Worker] Fetch failed:', error);
            });
            
          // Return cached response immediately, or wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});

// Background sync for pending operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncPendingAnalysis());
  }
});

// Function to sync pending analysis operations
async function syncPendingAnalysis() {
  console.log('[Service Worker] Syncing pending analysis results');
  
  try {
    // In a real implementation, you would:
    // 1. Open IndexedDB
    // 2. Get pending analysis operations
    // 3. Send them to the server
    // 4. Update the local database
    
    // Placeholder for demonstration
    const pendingOperations = await getPendingOperationsFromIndexedDB();
    if (pendingOperations.length > 0) {
      console.log(`[Service Worker] Found ${pendingOperations.length} pending operations`);
      // Process operations
    }
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    return false;
  }
}

// Placeholder function - replace with actual implementation
async function getPendingOperationsFromIndexedDB() {
  // In a real app, implement IndexedDB operations here
  return [];
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Analysis completed',
    icon: '/src/assets/icons/icon-192x192.png',
    badge: '/src/assets/icons/badge-128x128.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Resume Matcher Update',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window open
      for (const client of windowClients) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
}); 