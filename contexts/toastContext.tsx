/**
 * Toast Context and Hook
 * Provides toast notification functionality throughout the app
 */
import React, { createContext, useCallback, useContext } from 'react';

import Toast from 'react-native-toast-message';

import { ApiError } from '@/lib/types/apiTypes';
import { getUserErrorMessage } from '@/lib/utils/errorTranslator';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  text1?: string;
  text2?: string;
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

interface ToastContextType {
  showSuccess: (
    message: string,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  showError: (
    message: string,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  showInfo: (
    message: string,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  showWarning: (
    message: string,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  showApiError: (
    error: ApiError | Error,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  showToast: (
    type: ToastType,
    message: string,
    subtitle?: string,
    options?: ToastOptions
  ) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const showSuccess = useCallback(
    (message: string, subtitle?: string, options?: ToastOptions) => {
      Toast.show({
        type: 'success',
        text1: message,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 3000,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const showError = useCallback(
    (message: string, subtitle?: string, options?: ToastOptions) => {
      Toast.show({
        type: 'error',
        text1: message,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 4000,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const showInfo = useCallback(
    (message: string, subtitle?: string, options?: ToastOptions) => {
      Toast.show({
        type: 'info',
        text1: message,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 3000,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const showWarning = useCallback(
    (message: string, subtitle?: string, options?: ToastOptions) => {
      Toast.show({
        type: 'warning',
        text1: message,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 3500,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const showApiError = useCallback(
    (error: ApiError | Error, subtitle?: string, options?: ToastOptions) => {
      const userMessage = getUserErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: userMessage,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 4000,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      subtitle?: string,
      options?: ToastOptions
    ) => {
      Toast.show({
        type,
        text1: message,
        text2: subtitle,
        visibilityTime: options?.visibilityTime ?? 3000,
        autoHide: options?.autoHide ?? true,
        topOffset: options?.topOffset ?? 60,
        bottomOffset: options?.bottomOffset ?? 40,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    Toast.hide();
  }, []);

  const value: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showApiError,
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 * @throws Error if used outside ToastProvider
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
