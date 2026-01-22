/**
 * Utility to translate API error codes to user-friendly messages
 * Uses i18n for translations and only uses the error.code field from API responses
 */

import i18n from '@/translation';
import { ApiError } from '../types/apiTypes';

/**
 * Get translated error message from API error code
 * @param error - API error object with code
 * @param fallback - Optional fallback message if translation not found
 * @returns Translated error message
 */
export function getTranslatedError(error: ApiError | Error, fallback?: string): string {
  // Extract error code
  let errorCode: string | undefined;
  
  if ('code' in error && error.code) {
    errorCode = error.code;
  } else if (error instanceof Error) {
    // If it's a plain Error, try to extract code from message or use UNKNOWN_ERROR
    errorCode = 'UNKNOWN_ERROR';
  } else {
    errorCode = 'UNKNOWN_ERROR';
  }

  // Get translation key
  const translationKey = `common.errors.${errorCode}`;
  
  // Try to get translation
  const translatedMessage = i18n.t(translationKey, {
    defaultValue: undefined,
  });

  // If translation exists and is different from the key, use it
  if (translatedMessage && translatedMessage !== translationKey) {
    // Handle interpolation for messages with placeholders (e.g., MISSING_REQUIRED_FIELDS)
    if (errorCode === 'MISSING_REQUIRED_FIELDS' && 'details' in error && error.details) {
      const missingFields = error.details.missingFields || error.details.missing_fields;
      if (missingFields) {
        const fieldsList = Array.isArray(missingFields) 
          ? missingFields.join(', ') 
          : String(missingFields);
        return i18n.t(translationKey, { missingFields: fieldsList });
      }
    }
    
    return translatedMessage;
  }

  // Use fallback or default message
  return fallback || i18n.t('common.errors.UNKNOWN_ERROR', { defaultValue: 'An error occurred' });
}

/**
 * Get user-friendly error message from API error
 * This function should be used in UI components to display errors to users
 * @param error - API error object
 * @returns User-friendly error message
 */
export function getUserErrorMessage(error: ApiError | Error): string {
  return getTranslatedError(error);
}
