const DB_NAME = 'resumeMatcherDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingAnalysis';

interface PendingAnalysis {
  id?: number; // Auto-incrementing primary key
  timestamp: number;
  resumeData: any; // Consider defining a more specific type if possible
  jobDescription: string;
  apiKey: string; // Store the API key used for the request
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
        // Add more stores or indices if needed in future versions
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', request.error);
        reject(`IndexedDB error: ${request.error}`);
        dbPromise = null; // Reset promise on error
      };
    });
  }
  return dbPromise;
}

export async function addPendingAnalysis(analysisData: Omit<PendingAnalysis, 'id'>): Promise<number> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(analysisData);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      console.error('Error adding pending analysis:', request.error);
      reject(request.error);
    };
  });
}

export async function getPendingAnalyses(): Promise<PendingAnalysis[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as PendingAnalysis[]);
    };

    request.onerror = () => {
      console.error('Error getting pending analyses:', request.error);
      reject(request.error);
    };
  });
}

export async function deletePendingAnalysis(id: number): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting pending analysis:', request.error);
      reject(request.error);
    };
  });
} 