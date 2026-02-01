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
export function getTranslatedError(
  error: ApiError | Error,
  fallback?: string
): string {
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
  const translatedMessage = i18n.t(translationKey, {defaultValue: undefined,});

  // If translation exists and is different from the key, use it
  if (translatedMessage && translatedMessage !== translationKey) {
    // Handle interpolation for messages with placeholders (e.g., MISSING_REQUIRED_FIELDS)
    if (
      errorCode === 'MISSING_REQUIRED_FIELDS' &&
      'details' in error &&
      error.details
    ) {
      const missingFields =
        error.details.missingFields || error.details.missing_fields;
      if (missingFields) {
        const fieldsList = Array.isArray(missingFields)
          ? missingFields.join(', ')
          : String(missingFields);
        return i18n.t(translationKey, { missingFields: fieldsList });
      }
    }

    // Handle validation errors with details array
    if (
      errorCode === 'VALIDATION_ERROR' &&
      'details' in error &&
      error.details
    ) {
      const details = error.details;
      // Check if details is an array of validation errors
      if (Array.isArray(details) && details.length > 0) {
        // Get the first validation error message
        const firstError = details[0];
        if (
          firstError &&
          typeof firstError === 'object' &&
          'message' in firstError
        ) {
          // Try to translate the specific validation code
          const validationCode = firstError.code || firstError.validation;
          const fieldPath = firstError.path;

          // Build a more specific translation key (e.g., INVALID_EMAIL for email field with invalid_string)
          if (
            validationCode &&
            fieldPath &&
            Array.isArray(fieldPath) &&
            fieldPath.length > 0
          ) {
            const fieldName = fieldPath[0];
            // For email field with invalid_string, use INVALID_EMAIL
            if (fieldName === 'email' && validationCode === 'invalid_string') {
              const emailKey = 'common.errors.INVALID_EMAIL';
              const emailMessage = i18n.t(emailKey, {defaultValue: undefined,});
              if (emailMessage && emailMessage !== emailKey) {
                return emailMessage;
              }
            }
          }

          if (validationCode) {
            const validationKey = `common.errors.${validationCode.toUpperCase()}`;
            const validationMessage = i18n.t(validationKey, {defaultValue: undefined,});
            if (validationMessage && validationMessage !== validationKey) {
              return validationMessage;
            }
          }
          // Fallback to the message from the API
          if (typeof firstError.message === 'string') {
            return firstError.message;
          }
        }
      }
    }

    return translatedMessage;
  }

  // Use fallback or default message
  return (
    fallback ||
    i18n.t('common.errors.UNKNOWN_ERROR', { defaultValue: 'An error occurred' })
  );
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
