/**
 * Utility functions for managing service workers
 */

/**
 * Unregisters all service workers and clears all caches
 * This can be used to force a clean reload when a major UI update happens
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  try {
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered:', registration);
      }
    }

    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }

    console.log('All service workers unregistered and caches cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear service worker cache:', error);
    return false;
  }
}

/**
 * Checks if there's a new version of the service worker
 * Returns true if a service worker update was found
 */
export async function checkForServiceWorkerUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return !!registration.waiting; // returns true if there's a waiting worker
    } catch (error) {
      console.error('Failed to check for service worker updates:', error);
      return false;
    }
  }
  return false;
} 