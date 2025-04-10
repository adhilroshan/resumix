import { ApiKeyService } from './apiKeyService';

/**
 * Make a request to the OpenRouter API with API key rotation
 */
export async function makeOpenRouterRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKeyService = ApiKeyService.getInstance();
  const apiKey = await apiKeyService.getNextKey();
  
  if (!apiKey) {
    throw new Error('No valid API keys available. Please add a valid API key.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  
  const requestOptions: RequestInit = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`https://openrouter.ai/api/v1${endpoint}`, requestOptions);
    
    if (response.ok) {
      // Report successful usage
      await apiKeyService.reportSuccess(apiKey);
    } else {
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        // API key is invalid or unauthorized
        const errorBody = await response.clone().text();
        await apiKeyService.reportError(apiKey, errorBody);
      } else if (response.status === 429) {
        // Rate limit hit, report error but don't invalidate key
        const errorBody = await response.clone().text();
        await apiKeyService.reportError(apiKey, errorBody);
      } else {
        // Other errors
        const errorBody = await response.clone().text();
        await apiKeyService.reportError(apiKey, errorBody);
      }
    }
    
    return response;
  } catch (error) {
    // Network errors or other exceptions
    await apiKeyService.reportError(apiKey, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
} 