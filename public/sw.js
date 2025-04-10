// This is the service worker for the Resume Matcher PWA

const CACHE_NAME = 'resumix-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache our static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Resumix Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Resumix Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Don't cache API requests or non-GET requests
        if (
          !event.request.url.includes('/api/') &&
          event.request.method === 'GET'
        ) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});

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

// --- Simplified API Call Logic for SW ---
async function performAnalysisRequest(apiKey, prompt) {
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
    throw new Error(`SW API request failed: ${response.status}`);
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