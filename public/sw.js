// This is the service worker for the Resume Matcher PWA

const CACHE_NAME = 'resumix-v1.4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/src/main.tsx',
  '/src/styles.css'
];

// Add core runtime caching strategies
const RUNTIME_CACHE = 'resumix-runtime';

// --- API Key Management ---
const STORAGE_KEY = 'openrouter_api_keys';
const DEFAULT_KEYS = [
  // Default key(s) here - consider adding at least one fallback key
  // 'sk-or-v1-example-key'
];

// Simple API key rotation system for the service worker
class ApiKeyManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.loadKeys();
  }
  
  async loadKeys() {
    try {
      // Try to get from IndexedDB first
      const db = await this.getDb();
      const keys = await this.getKeysFromDb(db);
      
      if (keys && keys.length > 0) {
        this.keys = keys;
        return;
      }
      
      // Fallback to default keys
      this.keys = DEFAULT_KEYS.map(key => ({
        key,
        isValid: true,
        errorCount: 0
      }));
    } catch (error) {
      console.error('[SW] Failed to load API keys:', error);
      // Fallback to default keys
      this.keys = DEFAULT_KEYS.map(key => ({
        key,
        isValid: true,
        errorCount: 0
      }));
    }
  }
  
  getDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('resumeMatcherDB', 1);
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject('IndexedDB error: ' + request.error);
    });
  }
  
  getKeysFromDb(db) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains('apiKeys')) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction('apiKeys', 'readonly');
      const store = transaction.objectStore('apiKeys');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error getting API keys: ' + request.error);
    });
  }
  
  getNextKey() {
    if (this.keys.length === 0) {
      return null;
    }
    
    // Find the next valid key
    let count = 0;
    while (count < this.keys.length) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      if (this.keys[this.currentIndex].isValid) {
        return this.keys[this.currentIndex].key;
      }
      count++;
    }
    
    // No valid keys found
    return null;
  }
  
  markKeyAsInvalid(key) {
    const keyIndex = this.keys.findIndex(k => k.key === key);
    if (keyIndex >= 0) {
      this.keys[keyIndex].isValid = false;
      this.keys[keyIndex].errorCount++;
    }
  }
  
  incrementErrorCount(key) {
    const keyIndex = this.keys.findIndex(k => k.key === key);
    if (keyIndex >= 0) {
      this.keys[keyIndex].errorCount++;
      // Mark as invalid after too many errors
      if (this.keys[keyIndex].errorCount >= 5) {
        this.keys[keyIndex].isValid = false;
      }
    }
  }
}

// Initialize the key manager
const apiKeyManager = new ApiKeyManager();

// Install event - cache our static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Resumix Service Worker v2.2...');
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Resumix Service Worker v2.2...');
  // Take control immediately
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
});

// Fetch event - Network First for API, Cache First for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignore DevTools requests, browser extensions, etc.
  if (!/^https?:/.test(url.protocol)) return;
  
  // Parse the URL for smarter caching decisions
  const isAPI = url.pathname.includes('/api/') || url.hostname.includes('openrouter.ai');
  const isNavigationRequest = event.request.mode === 'navigate';
  const isStaticAsset = ASSETS_TO_CACHE.includes(url.pathname) || 
                         url.pathname.match(/\.(js|css|woff2?|ttf|png|jpe?g|svg|gif)$/i);
  
  if (isAPI) {
    // Network-first for API requests
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isNavigationRequest) {
    // Cache-first with network fallback for navigation
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (isStaticAsset) {
    // Stale-while-revalidate for static assets
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  } else {
    // Default to network-first for everything else
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache-first strategy
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        updateCache(request);
        return cachedResponse;
      }
      
      // Not in cache, get from network
      return fetch(request)
        .then(response => {
          // Cache the response for future
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(error => {
          console.error('[SW] Fetch failed:', error);
          // For navigation requests, return a fallback
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw error;
        });
    });
}

// Network-first strategy
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Don't cache non-successful responses or opaque responses
      if (!response || response.status !== 200 || response.type === 'opaque') {
        return response;
      }
      
      // Cache successful responses
      const responseToCache = response.clone();
      caches.open(RUNTIME_CACHE).then(cache => {
        cache.put(request, responseToCache);
      });
      
      return response;
    })
    .catch(error => {
      // Network failed, try the cache
      return caches.match(request);
    });
}

// Stale-while-revalidate strategy
function staleWhileRevalidateStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Update the cache in the background
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Cache the new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.error('[SW] Background fetch failed:', error);
        });
      
      // Return the cached response immediately if we have it
      return cachedResponse || fetchPromise;
    });
}

// Update cache in the background
function updateCache(request) {
  fetch(request)
    .then(response => {
      if (!response || response.status !== 200) return;
      
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
      });
    })
    .catch(error => {
      console.error('[SW] Update cache failed:', error);
    });
}

// --- IndexedDB Utilities (simplified for SW context) ---
const DB_NAME_SW = 'resumeMatcherDB';
const DB_VERSION_SW = 1;
const STORE_NAME_SW = 'pendingAnalysis';

function getDbSw() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME_SW, DB_VERSION_SW);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('IndexedDB error in SW: ' + request.error);
  });
}

async function getPendingAnalysesSw() {
  const db = await getDbSw();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME_SW, 'readonly');
    const store = transaction.objectStore(STORE_NAME_SW);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error getting pending SW: ' + request.error);
  });
}

async function deletePendingAnalysisSw(id) {
  const db = await getDbSw();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME_SW, 'readwrite');
    const store = transaction.objectStore(STORE_NAME_SW);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting pending SW: ' + request.error);
  });
}

// --- Simplified API Call Logic for SW with Key Rotation ---
async function performAnalysisRequest(userProvidedKey, prompt) {
  // First try with user provided key if available
  if (userProvidedKey) {
    try {
      return await makeApiRequest(userProvidedKey, prompt);
    } catch (error) {
      console.log('[SW] User provided key failed, falling back to rotation');
      // Continue to key rotation if user key fails
    }
  }
  
  // Try with rotated keys
  let attempts = 0;
  const maxAttempts = 3;  // Try up to 3 different keys
  
  while (attempts < maxAttempts) {
    attempts++;
    const apiKey = apiKeyManager.getNextKey();
    
    if (!apiKey) {
      throw new Error('No valid API keys available');
    }
    
    try {
      return await makeApiRequest(apiKey, prompt);
    } catch (error) {
      console.error(`[SW] API request failed with key (attempt ${attempts}):`, error);
      
      // Check if it's a rate limit or auth error
      if (error.status === 429 || error.status === 401 || error.status === 403) {
        apiKeyManager.markKeyAsInvalid(apiKey);
      } else {
        apiKeyManager.incrementErrorCount(apiKey);
      }
      
      // Continue to next key if we haven't reached max attempts
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }
  
  throw new Error('All API key attempts failed');
}

async function makeApiRequest(apiKey, prompt) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    }
  );

  if (!response.ok) {
    const error = new Error(`SW API request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('SW API: No content');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('SW API: Could not extract JSON');

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error('SW API: Failed to parse JSON');
  }
}

// --- Sync Event Implementation ---
self.addEventListener('sync', (event) => {
  console.log('[Resumix SW] Background sync event:', event.tag);
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncPendingAnalysis());
  }
});

async function syncPendingAnalysis() {
  console.log('[Resumix SW] Starting sync process...');
  try {
    const pendingOperations = await getPendingAnalysesSw();
    console.log(`[Resumix SW] Found ${pendingOperations.length} pending analysis operations.`);

    for (const op of pendingOperations) {
      console.log(`[Resumix SW] Processing pending analysis ID: ${op.id}`);
      try {
        const resumeData = op.resumeData;
        const jobDescription = op.jobDescription;
        const prompt = `
          You are an expert resume and job application advisor. Analyze the match between the candidate's resume and the job description provided.
          RESUME INFORMATION:
          ---
          ${resumeData.resumeText}
          USER INFORMATION:
          ---
          Name: ${resumeData.userInfo.fullName}
          Current/Desired Title: ${resumeData.userInfo.jobTitle}
          Years of Experience: ${resumeData.userInfo.yearsOfExperience}
          Education: ${resumeData.userInfo.educationLevel}
          Professional Summary: ${resumeData.userInfo.bio}
          SKILLS:
          ---
          ${resumeData.skills.join(', ')}
          JOB DESCRIPTION:
          ---
          ${jobDescription}
          Please provide a structured analysis of the match between the resume and the job description with the following information:
          1. Overall match percentage (0-100)
          2. Skills match percentage (0-100)
          3. Experience match percentage (0-100)
          4. List of 3-5 specific recommendations to improve the resume for this job
          5. List of key skills mentioned in the job description that are missing from the resume
          Format your response as a valid JSON object with the following structure:
          {
            "overallMatch": number,
            "skillsMatch": number,
            "experienceMatch": number,
            "recommendations": [string, string, ...],
            "missingSkills": [string, string, ...]
          }
          `;
        const analysisResult = await performAnalysisRequest(op.apiKey, prompt);
        console.log(`[Resumix SW] API call successful for ID: ${op.id}`);
        await deletePendingAnalysisSw(op.id);
        console.log(`[Resumix SW] Deleted pending analysis ID: ${op.id}`);

        // Check permission before showing notification
        if (self.Notification && self.Notification.permission === 'granted') {
          self.registration.showNotification('Resumix Analysis Completed', {
              body: `Background analysis for job description processed successfully.`,
              icon: '/pwa-192x192.png'
          });
        } else {
          console.log('[Resumix SW] Notification permission not granted, skipping notification.');
        }
      } catch (error) {
        console.error(`[Resumix SW] Failed to process pending analysis ID: ${op.id}`, error);
      }
    }
    console.log('[Resumix SW] Sync process finished.');
    return true;
  } catch (error) {
    console.error('[Resumix SW] Background sync failed catastrophically:', error);
    return false;
  }
}

// --- Push & NotificationClick Listeners ---

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[Resumix SW] Push received:', event);
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Analysis completed',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png', // Use same icon for badge for simplicity
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Resumix Update',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Resumix SW] Notification click received:', event);
  // ... rest of notificationclick ...
});

// Add message event listener for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting...');
    self.skipWaiting();
  }
});

// ... rest of the service worker ...