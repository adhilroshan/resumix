import { StorageService } from './storageService'; // Import StorageService
import { addPendingAnalysis } from '../utils/indexedDbUtils'; // Import IndexedDB utility
import { ApiKeyService } from './apiKeyService';
import { throttle } from '../utils/debounceUtils';

// Define the AnalysisResumeData interface locally to fix import issue
interface AnalysisResumeData {
  resumeText: string;
  userInfo: {
    fullName: string;
    jobTitle: string;
    yearsOfExperience: string;
    educationLevel: string;
    bio: string;
  };
  skills: string[];
}

// Interface for the result expected from the API (before adding jobDescription/timestamp)
interface ApiResponseResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  recommendations: string[];
  missingSkills: string[];
}

// Simple request cache to prevent duplicate API calls
type CacheKey = string;

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // Extend cache to 24 hours
const CACHE_DB_NAME = 'apiResponseCache';
const CACHE_STORE_NAME = 'responses';
const CACHE_DB_VERSION = 1;

// Enhanced cache structure with IndexedDB support
class ApiResponseCache {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache = new Map<string, any>();
  
  constructor() {
    this.initDatabase();
  }
  
  private initDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object store with timestamp index for expiration management
          if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
            const store = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
        
        request.onerror = () => {
          console.error('Error opening cache database:', request.error);
          reject(request.error);
          this.dbPromise = null;
        };
      });
    }
    
    return this.dbPromise;
  }
  
  async get(key: string): Promise<any | null> {
    // Try memory cache first for fastest access
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() - cached.timestamp < CACHE_EXPIRATION) {
        return cached.data;
      }
      this.memoryCache.delete(key);
    }
    
    try {
      const db = await this.initDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction(CACHE_STORE_NAME, 'readonly');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = () => {
          if (!request.result) {
            resolve(null);
            return;
          }
          
          const { data, timestamp } = request.result;
          
          // Check if expired
          if (Date.now() - timestamp > CACHE_EXPIRATION) {
            // Clean up expired entry
            this.delete(key).catch(console.error);
            resolve(null);
            return;
          }
          
          // Update memory cache for faster subsequent access
          this.memoryCache.set(key, { data, timestamp });
          resolve(data);
        };
        
        request.onerror = () => {
          console.error('Error getting from cache:', request.error);
          resolve(null); // Resolve with null on error to not break the app
        };
      });
    } catch (error) {
      console.error('Cache access error:', error);
      return null;
    }
  }
  
  async set(key: string, data: any): Promise<void> {
    // Update memory cache
    const timestamp = Date.now();
    this.memoryCache.set(key, { data, timestamp });
    
    try {
      const db = await this.initDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        store.put({ key, data, timestamp });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.error('Error setting cache:', transaction.error);
          resolve(); // Resolve anyway to not break the app
        };
      });
    } catch (error) {
      console.error('Cache write error:', error);
      // Continue without persistent caching if IDB fails
    }
  }
  
  async delete(key: string): Promise<void> {
    // Remove from memory cache
    this.memoryCache.delete(key);
    
    try {
      const db = await this.initDatabase();
      return new Promise((resolve) => {
        const transaction = db.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        store.delete(key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.error('Error deleting from cache:', transaction.error);
          resolve(); // Resolve anyway to not break the app
        };
      });
    } catch (error) {
      console.error('Cache delete error:', error);
      // Continue even if deletion fails
    }
  }
  
  // Cleanup expired cache entries - can be called periodically
  async cleanupExpired(): Promise<void> {
    try {
      const db = await this.initDatabase();
      const expirationThreshold = Date.now() - CACHE_EXPIRATION;
      
      return new Promise((resolve) => {
        const transaction = db.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CACHE_STORE_NAME);
        const index = store.index('timestamp');
        
        // Find all entries older than expiration threshold
        const range = IDBKeyRange.upperBound(expirationThreshold);
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            // Delete expired entry
            cursor.delete();
            cursor.continue();
          }
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.error('Error during cache cleanup:', transaction.error);
          resolve();
        };
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Create singleton instance of cache
const apiCache = new ApiResponseCache();

// Clean up expired cache entries when service initializes and periodically
apiCache.cleanupExpired().catch(console.error);
setInterval(() => apiCache.cleanupExpired().catch(console.error), 30 * 60 * 1000); // Every 30 minutes

// Generate a cache key based on resume and job description
function generateCacheKey(resumeData: AnalysisResumeData, jobDescription: string): CacheKey {
  // Use a hash of the resume text and job description to create a cache key
  const text = `${resumeData.resumeText}-${jobDescription}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return `analysis-${hash}`;
}

// Request queue to batch API requests
interface QueuedRequest {
  resumeData: AnalysisResumeData;
  jobDescription: string;
  resolve: (result: ApiResponseResult) => void;
  reject: (error: Error) => void;
}

let requestQueue: QueuedRequest[] = [];
let isProcessingQueue = false;

// Process the request queue - throttled to prevent too many API calls
const processQueue = throttle(async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  const request = requestQueue.shift()!;
  
  try {
    // Process one request from the queue
    const result = await processAnalysisRequest(request.resumeData, request.jobDescription);
    request.resolve(result);
  } catch (error) {
    request.reject(error instanceof Error ? error : new Error(String(error)));
  } finally {
    isProcessingQueue = false;
    // Continue processing if there are more requests
    if (requestQueue.length > 0) {
      processQueue();
    }
  }
}, 500); // Throttle to max 2 requests per second

// Modify the existing analyzeResumeMatch function to use the enhanced cache
export async function analyzeResumeMatch(
  resumeData: AnalysisResumeData,
  jobDescription: string,
): Promise<ApiResponseResult> {
  // Generate a cache key
  const cacheKey = generateCacheKey(resumeData, jobDescription);
  
  // Try to get from enhanced cache
  const cachedResult = await apiCache.get(cacheKey);
  if (cachedResult) {
    console.log('Using cached analysis result');
    return cachedResult;
  }
  
  // Add the request to the queue and handle it as a promise
  return new Promise((resolve, reject) => {
    requestQueue.push({
      resumeData,
      jobDescription,
      resolve: async (result) => {
        // Cache the result before resolving
        await apiCache.set(cacheKey, result).catch(console.error);
        resolve(result);
      },
      reject
    });
    
    // Start processing the queue
    processQueue();
  });
}

// The actual request processing logic (internal function)
async function processAnalysisRequest(
  resumeData: AnalysisResumeData,
  jobDescription: string
): Promise<ApiResponseResult> {
  // Get user's API key as the first option
  const userApiKey = StorageService.getOpenRouterApiKey();
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

  let attemptCount = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  try {
    const apiKeyService = ApiKeyService.getInstance();
    // Prefetch and initialize API keys - performance optimization
    await apiKeyService.initialize();
    
    let currentApiKey = userApiKey;

    // This will try user's key first (if available), and then rotate through service keys
    while (attemptCount < maxAttempts) {
      // If user key failed or is not available, try to get a key from the rotation service
      if (!currentApiKey || attemptCount > 0) {
        // Await the async getNextKey method to get a string | null
        currentApiKey = await apiKeyService.getNextKey();
        
        // If no valid keys are available, throw an error
        if (!currentApiKey) {
          throw new Error('No valid API keys available for use. Please add a key in settings.');
        }
      }
      
      attemptCount++;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentApiKey}`,
              "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '', 
              "X-Title": "Resume Matcher",
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat-v3-0324:free",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.3,
              max_tokens: 1500,
            }),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Check for rate limiting or auth issues
          if (response.status === 429 || response.status === 401 || response.status === 403) {
            // Mark the key as invalid if it's a rate limit or auth error
            if (currentApiKey === userApiKey) {
              console.warn('User API key invalid or rate limited.');
            } else {
              await apiKeyService.markKeyAsInvalid(currentApiKey);
            }
            // Continue to next iteration to try another key
            continue;
          }
          
          // For other errors, increment error count but don't immediately invalidate
          if (currentApiKey !== userApiKey) {
            await apiKeyService.incrementErrorCount(currentApiKey);
          }
          
          lastError = new Error(`API request failed with status ${response.status}`);
          continue; // Try another key
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (!content) {
          lastError = new Error('No content in API response');
          continue;
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("Raw response content:", content);
          lastError = new Error('Could not extract valid JSON from API response');
          continue;
        }

        let result: ApiResponseResult;
        try {
          result = JSON.parse(jsonMatch[0]) as ApiResponseResult;
        } catch (parseError) {
          console.error("Failed to parse JSON:", jsonMatch[0], parseError);
          lastError = new Error('Failed to parse JSON from API response');
          continue;
        }

        if (typeof result.overallMatch !== 'number' || 
            typeof result.skillsMatch !== 'number' || 
            typeof result.experienceMatch !== 'number' || 
            !Array.isArray(result.recommendations) || 
            !Array.isArray(result.missingSkills)) {
          console.error("Invalid JSON structure received:", result);
          lastError = new Error('Invalid structure in API response JSON');
          continue;
        }

        // Save successful result directly to StorageService (which handles history)
        StorageService.saveAnalysisResult(
          { ...result, jobDescription: jobDescription },
          jobDescription
        );

        // If we're using a service key (not user's key), record successful usage
        if (currentApiKey !== userApiKey && currentApiKey) {
          await apiKeyService.recordSuccessfulUsage(currentApiKey);
        }

        return result;
      } catch (error) {
        console.error(`API request attempt ${attemptCount} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this was the last attempt, we'll throw the error outside the loop
        // Otherwise, continue to the next iteration to try another key
      }
    }
    
    // If we've tried all keys and still failed, throw the last error
    throw lastError || new Error('All API key attempts failed');
  } catch (error) {
    console.error('Error analyzing resume match:', error);

    // Check if Background Sync is available and error seems network-related
    if ('serviceWorker' in navigator && 
        navigator.serviceWorker.ready && 
        'SyncManager' in window && 
        error instanceof Error && 
        error.message.includes('fetch')) {
      try {
        console.log('Network error detected, attempting to queue for background sync...');
        const registration = await navigator.serviceWorker.ready;
        
        // Get the API key, but handle the case where it might be null
        const apiKey = StorageService.getOpenRouterApiKey();
        
        await addPendingAnalysis({ // Save data to IndexedDB
          timestamp: Date.now(),
          resumeData: resumeData,
          jobDescription: jobDescription,
          apiKey: apiKey || '' // Provide empty string if apiKey is null
        });
        await (registration as any).sync.register('sync-analysis'); // Register sync event
        console.log('Analysis request queued for background sync.');
        // Throw a specific error or return a value indicating queuing
        throw new Error('Network error: Analysis request queued for background sync.');
      } catch (syncError) {
        console.error('Failed to queue analysis for background sync:', syncError);
        // Fallback: re-throw the original error if queuing fails
        throw error;
      }
    } else {
      // If sync isn't available or it's not a network error, re-throw original error
      throw error;
    }
  }
}

// Use API key rotation service or fallback to user's key
export async function getApiKey(): Promise<string | null> {
  const apiKeyService = ApiKeyService.getInstance();
  
  // First try to get a valid key from the rotation service
  const serviceKey = await apiKeyService.getNextKey();
  if (serviceKey) {
    return serviceKey;
  }
  
  // If no service keys are available, fall back to user's key
  return StorageService.getOpenRouterApiKey();
} 