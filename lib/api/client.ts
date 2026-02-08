/**
 * API Client configuration using Axios
 */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';

import { enqueueRequest } from '../storage/queue';
import { getAccessToken, isTokenExpired } from '../storage/secureStorage';
import { isOffline } from '../sync/networkMonitor';
import { ApiError } from '../types/apiTypes';
import { API_BASE_URL, REQUEST_TIMEOUT, RETRY_CONFIG } from './endpoints';

// Extended AxiosRequestConfig with custom properties
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

class ApiClientClass {
  private client: AxiosInstance;

  private retryCountMap = new Map<string, number>();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: ExtendedInternalAxiosRequestConfig) => {
        // Skip auth for certain endpoints
        if (config.skipAuth) {
          return config;
        }

        // Handle FormData - remove Content-Type header to let browser/axios set it with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        // Add access token if available
        const token = await getAccessToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check if token is expired (will be handled by response interceptor)
        if (token && (await isTokenExpired())) {
          console.warn('Access token expired, will attempt refresh');
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(this.handleError(error))
    );

    // Response interceptor - handle errors and retry
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Clear retry count on success
        const configKey = this.getConfigKey(response.config);
        this.retryCountMap.delete(configKey);
        return response;
      },
      async (error: AxiosError) => this.handleResponseError(error)
    );
  }

  private getConfigKey(config: ExtendedInternalAxiosRequestConfig): string {
    return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const originalRequest =
      error.config as ExtendedInternalAxiosRequestConfig & { _retry?: boolean };

    // Network error (offline)
    if (!error.response && error.request) {
      const isDeviceOffline = isOffline();

      if (
        isDeviceOffline &&
        originalRequest.method &&
        ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
          originalRequest.method.toUpperCase()
        )
      ) {
        // Queue the request for later
        try {
          await enqueueRequest({
            method: originalRequest.method.toUpperCase() as
              | 'POST'
              | 'PUT'
              | 'DELETE'
              | 'PATCH',
            url: originalRequest.url || '',
            data: originalRequest.data,
            headers: originalRequest.headers as Record<string, string>,
          });

          // Return a special error that indicates the request was queued
          const queuedError: ApiError = {
            message: 'Request queued for offline processing',
            code: 'OFFLINE_QUEUED',
            statusCode: 0,
          };
          (queuedError as any).isQueued = true;
          (queuedError as any).isNetworkError = true;
          return Promise.reject(queuedError);
        } catch (queueError) {
          console.error('Error queueing request:', queueError);
        }
      }

      // Network error - mark as network error
      const networkError: ApiError = {
        message: isDeviceOffline ? 'No internet connection' : 'Network error',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      };
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - token refresh will be handled by auth service
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Let the auth service handle token refresh
      // This will be implemented in the auth service
      const authError: ApiError = {
        message: 'Unauthorized - token may be expired',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      };
      (authError as any).requiresAuth = true;
      return Promise.reject(authError);
    }

    // Retry logic for certain status codes
    if (
      error.response &&
      RETRY_CONFIG.retryableStatusCodes.includes(error.response.status)
    ) {
      const configKey = this.getConfigKey(originalRequest);
      const retryCount = this.retryCountMap.get(configKey) || 0;

      if (retryCount < RETRY_CONFIG.maxRetries && originalRequest) {
        this.retryCountMap.set(configKey, retryCount + 1);

        // Exponential backoff
        const delay = RETRY_CONFIG.retryDelay * 2 ** retryCount;

        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.client(originalRequest);
      }
    }

    // Transform error to ApiError format
    return Promise.reject(this.handleError(error));
  }

  private handleError(error: AxiosError | Error): ApiError {
    if (isAxiosError(error)) {
      const responseData = error.response?.data as any;

      // Extract error code from API response structure:
      // { success: false, error: { code: "ERROR_CODE", message: "...", details: {...} } }
      // Also supports legacy format: { code: "ERROR_CODE", message: "..." }
      const errorCode =
        responseData?.error?.code ||
        responseData?.code ||
        error.code ||
        'UNKNOWN_ERROR';

      // Extract error message (for debugging/logs only, not for UI)
      const errorMessage =
        responseData?.error?.message ||
        responseData?.message ||
        error.message ||
        'An error occurred';

      // Extract error details
      const errorDetails =
        responseData?.error?.details || responseData?.details || responseData;

      return {
        message: errorMessage, // For debugging/logs only
        code: errorCode, // Use this for translation in UI
        statusCode: error.response?.status,
        details: errorDetails,
      };
    }

    return {
      message: error.message || 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Make a request
   */
  async request<T = any>(
    config: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: ExtendedAxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClientClass();
