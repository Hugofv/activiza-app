/**
 * Toast utility functions for displaying notifications
 * Integrates with error translator for API errors
 */
import Toast from 'react-native-toast-message';

import { ApiError } from '../types/apiTypes';
import { getUserErrorMessage } from './errorTranslator';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  text1?: string;
  text2?: string;
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

/**
 * Show a success toast
 */
export function showSuccess(
  message: string,
  subtitle?: string,
  options?: ToastOptions
) {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subtitle,
    visibilityTime: options?.visibilityTime ?? 3000,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? 60,
    bottomOffset: options?.bottomOffset ?? 40,
  });
}

/**
 * Show an error toast
 */
export function showError(
  message: string,
  subtitle?: string,
  options?: ToastOptions
) {
  Toast.show({
    type: 'error',
    text1: message,
    text2: subtitle,
    visibilityTime: options?.visibilityTime ?? 4000,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? 60,
    bottomOffset: options?.bottomOffset ?? 40,
  });
}

/**
 * Show an info toast
 */
export function showInfo(
  message: string,
  subtitle?: string,
  options?: ToastOptions
) {
  Toast.show({
    type: 'info',
    text1: message,
    text2: subtitle,
    visibilityTime: options?.visibilityTime ?? 3000,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? 60,
    bottomOffset: options?.bottomOffset ?? 40,
  });
}

/**
 * Show a warning toast
 */
export function showWarning(
  message: string,
  subtitle?: string,
  options?: ToastOptions
) {
  Toast.show({
    type: 'warning',
    text1: message,
    text2: subtitle,
    visibilityTime: options?.visibilityTime ?? 3500,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? 60,
    bottomOffset: options?.bottomOffset ?? 40,
  });
}

/**
 * Show an error toast from an API error
 * Automatically translates the error code to a user-friendly message
 */
export function showApiError(
  error: ApiError | Error,
  subtitle?: string,
  options?: ToastOptions
) {
  const userMessage = getUserErrorMessage(error);
  showError(userMessage, subtitle, options);
}

/**
 * Show a generic toast with custom type
 */
export function showToast(
  type: ToastType,
  message: string,
  subtitle?: string,
  options?: ToastOptions
) {
  Toast.show({
    type,
    text1: message,
    text2: subtitle,
    visibilityTime: options?.visibilityTime ?? 3000,
    autoHide: options?.autoHide ?? true,
    topOffset: options?.topOffset ?? 60,
    bottomOffset: options?.bottomOffset ?? 40,
  });
}

/**
 * Hide the current toast
 */
export function hideToast() {
  Toast.hide();
}
