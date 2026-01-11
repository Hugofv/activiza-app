/**
 * API Client configuration using Axios
 */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
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
      headers: {
        'Content-Type': 'application/json',
      },
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

        // Add access token if available
        const token = await getAccessToken();
        console.log('token', token);
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization header set:', config.headers.Authorization?.substring(0, 20) + '...');
        } else if (!token) {
          console.warn('No token available for request to:', config.url);
        } else {
          console.log('Authorization header already set');
        }

        // Check if token is expired (will be handled by response interceptor)
        if (token && (await isTokenExpired())) {
          console.warn('Access token expired, will attempt refresh');
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor - handle errors and retry
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Clear retry count on success
        const configKey = this.getConfigKey(response.config);
        this.retryCountMap.delete(configKey);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private getConfigKey(config: ExtendedInternalAxiosRequestConfig): string {
    return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const originalRequest = error.config as ExtendedInternalAxiosRequestConfig & { _retry?: boolean };

    // Network error (offline)
    if (!error.response && error.request) {
      const isDeviceOffline = isOffline();
      
      if (isDeviceOffline && originalRequest.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(originalRequest.method.toUpperCase())) {
        // Queue the request for later
        try {
          await enqueueRequest({
            method: originalRequest.method.toUpperCase() as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
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
    if (error.response && RETRY_CONFIG.retryableStatusCodes.includes(error.response.status)) {
      const configKey = this.getConfigKey(originalRequest);
      const retryCount = this.retryCountMap.get(configKey) || 0;

      if (retryCount < RETRY_CONFIG.maxRetries && originalRequest) {
        this.retryCountMap.set(configKey, retryCount + 1);
        
        // Exponential backoff
        const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return this.client(originalRequest);
      }
    }

    // Transform error to ApiError format
    return Promise.reject(this.handleError(error));
  }

  private handleError(error: AxiosError | Error): ApiError {
    if (isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || 'An error occurred',
        code: error.response?.data?.code || error.code || 'UNKNOWN_ERROR',
        statusCode: error.response?.status,
        details: error.response?.data,
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
  async request<T = any>(config: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClientClass();
