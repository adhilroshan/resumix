/**
 * Utility functions to extract and clean JSON from AI responses
 */

/**
 * Extracts JSON from a response that may be wrapped in markdown code blocks
 * @param response - The raw response from the AI
 * @returns Clean JSON string ready for parsing
 */
export function extractJSONFromResponse(response: string): string {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response: response must be a non-empty string');
  }

  let cleanedResponse = response.trim();

  // Try to extract JSON from markdown code blocks
  const codeBlockPatterns = [
    /```json\s*([\s\S]*?)\s*```/gi,  // ```json ... ```
    /```\s*([\s\S]*?)\s*```/gi,      // ``` ... ```
    /`{1,3}json\s*([\s\S]*?)\s*`{1,3}/gi,  // `json ... `, ``json ... ``, or ```json ... ```
  ];

  for (const pattern of codeBlockPatterns) {
    const match = cleanedResponse.match(pattern);
    if (match && match[1]) {
      cleanedResponse = match[1].trim();
      break;
    }
  }

  // Remove any leading/trailing text that might be outside the JSON
  // Look for JSON object start and end
  const jsonStart = cleanedResponse.indexOf('{');
  const jsonEnd = cleanedResponse.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
  }

  // Clean up common issues
  cleanedResponse = cleanedResponse
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
    .trim();

  return cleanedResponse;
}

/**
 * Validates if a string contains valid JSON
 * @param jsonString - String to validate
 * @returns true if valid JSON, false otherwise
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempts to parse and validate AI response with multiple fallback strategies
 * @param response - Raw AI response
 * @param schema - Optional schema to validate against (basic type checking)
 * @returns Parsed JSON object
 */
export function parseAIResponse(response: string, schema?: Record<string, any>): any {
  if (!response) {
    throw new Error('Empty response received from AI');
  }

  console.log('Raw AI response:', response);

  // Strategy 1: Direct parsing
  try {
    const parsed = JSON.parse(response);
    console.log('Direct JSON parsing successful');
    return validateParsedData(parsed, schema);
  } catch (error) {
    console.log('Direct JSON parsing failed, attempting extraction...');
  }

  // Strategy 2: Extract from markdown and parse
  try {
    const extracted = extractJSONFromResponse(response);
    console.log('Extracted JSON:', extracted);

    const parsed = JSON.parse(extracted);
    console.log('Extraction and parsing successful');
    return validateParsedData(parsed, schema);
  } catch (error) {
    console.error('JSON extraction failed:', error);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Basic validation of parsed data against expected schema
 * @param data - Parsed data to validate
 * @param schema - Schema definition for basic validation
 * @returns Validated data
 */
function validateParsedData(data: any, schema?: Record<string, any>): any {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is not a valid object');
  }

  // If schema is provided, do basic validation
  if (schema) {
    // Basic structure validation for resume analysis response
    const requiredFields = ['overallMatch', 'skillsMatch', 'experienceMatch', 'educationMatch'];
    const requiredArrays = ['recommendations', 'missingSkills', 'strengths', 'improvements'];

    for (const field of requiredFields) {
      if (typeof data[field] !== 'number' || data[field] < 0 || data[field] > 100) {
        console.warn(`Field ${field} should be a number between 0-100, got:`, data[field]);
        data[field] = Math.max(0, Math.min(100, Number(data[field]) || 0));
      }
    }

    for (const field of requiredArrays) {
      if (!Array.isArray(data[field])) {
        console.warn(`Field ${field} should be an array, got:`, typeof data[field]);
        data[field] = [];
      }
    }
  }

  return data;
}