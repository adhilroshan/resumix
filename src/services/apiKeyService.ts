/**
 * API Key Management Service
 * 
 * Handles rotation, validation, and management of OpenRouter API keys
 */

import CryptoJS from 'crypto-js';
import { debounce } from '../utils/debounceUtils';

// API Key object structure
export interface ApiKey {
  key: string;
  isValid: boolean;
  useCount: number;
  errorCount: number;
  lastUsed: number | null;
  lastError: string | null;
}

// Replace the environment variable reference with a browser-compatible version
// Instead of using process.env which is Node-specific
const DEFAULT_KEYS: string[] = 
  // Try to access from window.__ENV__ if it exists (common pattern for exposing env vars to browser)
  (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_DEFAULT_API_KEYS) ?
    (window as any).__ENV__.NEXT_PUBLIC_DEFAULT_API_KEYS.split(',') :
    // Fallback to empty array if no default keys are configured
    [];

export class ApiKeyService {
  private static instance: ApiKeyService;
  private keys: ApiKey[] = [];
  private currentKeyIndex: number = 0;
  private readonly STORAGE_KEY = 'encrypted_api_keys';
  private initialized = false;
  private encryptionKey: string;
  private keysLoaded = false;
  private saveInProgress = false;
  private keyCache: Map<string, ApiKey> = new Map(); // Cache for faster key lookups

  private constructor() {
    // Generate a device-specific encryption key (or use a stored one)
    this.encryptionKey = this.getOrCreateEncryptionKey();
    // Create a debounced save function to prevent excessive writes
    this.debouncedSaveKeys = debounce(this._saveKeys.bind(this), 300);
    
    // Initialize with any default keys if available and there are no existing keys
    this.ensureDefaultKeys();
  }

  /**
   * Get the singleton instance of ApiKeyService
   */
  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  /**
   * Initialize the service by loading stored keys
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Only load keys if they haven't been loaded yet
      if (!this.keysLoaded) {
        await this.loadKeys();
        this.keysLoaded = true;
        
        // Build key cache for faster lookups
        this.buildKeyCache();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ApiKeyService:', error);
      // Initialize with empty keys array if loading fails
      this.keys = [];
      this.initialized = true;
    }
  }

  /**
   * Build an in-memory cache for faster key lookups
   */
  private buildKeyCache(): void {
    this.keyCache.clear();
    for (const key of this.keys) {
      this.keyCache.set(key.key, key);
    }
  }

  /**
   * Generate or retrieve a device-specific encryption key
   */
  private getOrCreateEncryptionKey(): string {
    const storedKey = localStorage.getItem('device_encryption_key');
    if (storedKey) return storedKey;
    
    // Generate a random key specific to this device
    // In a production app, consider more robust methods
    const newKey = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem('device_encryption_key', newKey);
    return newKey;
  }
  
  /**
   * Encrypt a string using the encryption key
   */
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }
  
  /**
   * Decrypt a string using the encryption key
   */
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  /**
   * Save the keys to encrypted localStorage - actual implementation
   */
  private async _saveKeys(): Promise<void> {
    if (this.saveInProgress) return;
    
    try {
      this.saveInProgress = true;
      // Encrypt the entire keys array
      const encryptedData = this.encrypt(JSON.stringify(this.keys));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      
      // Rebuild the key cache after saving
      this.buildKeyCache();
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Failed to save API keys securely');
    } finally {
      this.saveInProgress = false;
    }
  }
  
  /**
   * Debounced version of saveKeys to reduce storage operations
   */
  private debouncedSaveKeys: () => void;
  
  /**
   * Public method to save keys - uses debounced version
   */
  private async saveKeys(): Promise<void> {
    this.debouncedSaveKeys();
  }
  
  /**
   * Load keys from encrypted localStorage
   */
  private async loadKeys(): Promise<void> {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) {
        this.keys = [];
        return;
      }
      
      const decryptedData = this.decrypt(encryptedData);
      this.keys = JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      this.keys = [];
    }
  }

  /**
   * Add a new API key
   */
  public async addKey(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Check if key already exists in the cache (faster lookup)
    if (this.keyCache.has(key)) {
      console.warn('API key already exists, not adding duplicate');
      return;
    }
    
    const newKey: ApiKey = {
      key,
      isValid: true,
      useCount: 0,
      errorCount: 0,
      lastUsed: null,
      lastError: null
    };
    
    this.keys.push(newKey);
    // Update cache immediately
    this.keyCache.set(key, newKey);
    
    await this.saveKeys();
  }

  /**
   * Remove an API key
   */
  public async removeKey(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    this.keys = this.keys.filter(k => k.key !== key);
    // Update cache immediately
    this.keyCache.delete(key);
    
    await this.saveKeys();
  }

  /**
   * Reset key statistics
   */
  public async resetKey(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Use the cache for faster lookups
    const cachedKey = this.keyCache.get(key);
    if (cachedKey) {
      cachedKey.isValid = true;
      cachedKey.useCount = 0;
      cachedKey.errorCount = 0;
      cachedKey.lastError = null;
      
      // Also update in the main array for consistency
      const keyIndex = this.keys.findIndex(k => k.key === key);
      if (keyIndex >= 0) {
        this.keys[keyIndex] = cachedKey;
      }
      
      await this.saveKeys();
    }
  }

  /**
   * Get the next valid API key using round-robin rotation
   * This is a performance-critical method that's called for every API request
   */
  public async getNextKey(): Promise<string | null> {
    if (!this.initialized) await this.initialize();
    
    if (this.keys.length === 0) {
      return null;
    }
    
    // Find the next valid key using round-robin with optimized lookups
    
    // Create a temporary array of valid keys for faster access
    const validKeys = this.keys.filter(k => k.isValid);
    if (validKeys.length === 0) return null;
    
    // Get the current index atomically
    const currentIndex = this.currentKeyIndex;
    // Update the index for the next call
    this.currentKeyIndex = (currentIndex + 1) % validKeys.length;
    
    // Simple circular access of valid keys
    const nextKey = validKeys[currentIndex % validKeys.length];
    
    return nextKey.key;
  }

  /**
   * Get all API keys (with sensitive data masked for UI display)
   */
  public async getAllKeys(): Promise<ApiKey[]> {
    if (!this.initialized) await this.initialize();
    
    // Return a copy of the keys array with actual keys masked for safety
    return this.keys.map(k => ({
      ...k,
      key: this.maskKey(k.key) // Mask the actual key value for UI display
    }));
  }

  /**
   * Mask most of a key for display purposes
   */
  private maskKey(key: string): string {
    if (key.length <= 10) return '••••••••••';
    return `${key.substring(0, 4)}••••${key.substring(key.length - 4)}`;
  }

  /**
   * Report a successful use of an API key
   */
  public async reportSuccess(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Use the cache for faster updates
    const cachedKey = this.keyCache.get(key);
    if (cachedKey) {
      cachedKey.useCount++;
      cachedKey.lastUsed = Date.now();
      
      // Update the main array for consistency
      const keyIndex = this.keys.findIndex(k => k.key === key);
      if (keyIndex >= 0) {
        this.keys[keyIndex] = cachedKey;
      }
      
      await this.saveKeys();
    }
  }

  /**
   * Record successful usage of an API key (alias for reportSuccess)
   */
  public async recordSuccessfulUsage(key: string): Promise<void> {
    return this.reportSuccess(key);
  }

  /**
   * Report an error with an API key
   */
  public async reportError(key: string, error: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Use the cache for faster updates
    const cachedKey = this.keyCache.get(key);
    if (cachedKey) {
      cachedKey.errorCount++;
      cachedKey.lastError = error;
      
      // If there are many errors, mark the key as invalid
      if (cachedKey.errorCount >= 3) {
        cachedKey.isValid = false;
      }
      
      // Update the main array for consistency
      const keyIndex = this.keys.findIndex(k => k.key === key);
      if (keyIndex >= 0) {
        this.keys[keyIndex] = cachedKey;
      }
      
      await this.saveKeys();
    }
  }

  /**
   * Increment error count for an API key
   */
  public async incrementErrorCount(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Use the cache for faster updates
    const cachedKey = this.keyCache.get(key);
    if (cachedKey) {
      cachedKey.errorCount++;
      
      // Update the main array for consistency
      const keyIndex = this.keys.findIndex(k => k.key === key);
      if (keyIndex >= 0) {
        this.keys[keyIndex] = cachedKey;
      }
      
      await this.saveKeys();
    }
  }

  /**
   * Mark an API key as invalid
   */
  public async markKeyAsInvalid(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    // Use the cache for faster updates
    const cachedKey = this.keyCache.get(key);
    if (cachedKey) {
      cachedKey.isValid = false;
      
      // Update the main array for consistency
      const keyIndex = this.keys.findIndex(k => k.key === key);
      if (keyIndex >= 0) {
        this.keys[keyIndex] = cachedKey;
      }
      
      await this.saveKeys();
    }
  }

  /**
   * Get all stored API keys
   */
  public async getKeyCount(): Promise<number> {
    if (!this.initialized) await this.initialize();
    return this.keys.length;
  }
  
  /**
   * Get count of valid API keys
   */
  public async getValidKeyCount(): Promise<number> {
    if (!this.initialized) await this.initialize();
    return this.keys.filter(k => k.isValid).length;
  }
  
  /**
   * Import multiple API keys at once
   */
  public async importKeys(keys: string[]): Promise<number> {
    if (!this.initialized) await this.initialize();
    
    let addedCount = 0;
    for (const key of keys) {
      // Skip if key already exists (use cache for faster lookup)
      if (this.keyCache.has(key)) continue;
      
      const newKey: ApiKey = {
        key,
        isValid: true,
        useCount: 0,
        errorCount: 0,
        lastUsed: null,
        lastError: null
      };
      
      this.keys.push(newKey);
      this.keyCache.set(key, newKey);
      
      addedCount++;
    }
    
    if (addedCount > 0) {
      await this.saveKeys();
    }
    
    return addedCount;
  }

  /**
   * Initialize the service with default keys if none exist yet
   */
  private async ensureDefaultKeys(): Promise<void> {
    await this.initialize();
    
    // If we have no keys and DEFAULT_KEYS are available, add them
    if (this.keys.length === 0 && DEFAULT_KEYS.length > 0) {
      console.log(`Adding ${DEFAULT_KEYS.length} default API keys`);
      
      // Add each default key
      for (const key of DEFAULT_KEYS) {
        if (key && key.trim()) {
          await this.addKey(key.trim());
        }
      }
    }
  }
}

export default ApiKeyService; 