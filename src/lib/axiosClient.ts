import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

// Create Centralized Axios Instance
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: JWT Auth Injection ──────────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && !token.startsWith('local_')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor: Standard Error & 401 Handling ──────────────────────
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return data directly if standard ApiResponse envelope is present
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Request failed';

    // Handle 401 Unauthorized (Token expired / invalid)
    if (status === 401) {
      console.warn('[AxiosClient 401 Unauthorized]:', message);
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
          toast.error('Session expired. Please log in again.');
        }
      }
    } else if (status === 403) {
      toast.error(message || 'You do not have permission for this action');
    } else if (status >= 500) {
      console.error('[AxiosClient 500 Server Error]:', message);
    }

    return Promise.reject({
      status: status || 500,
      message,
      data: error?.response?.data?.data || null,
      errors: error?.response?.data?.errors || null,
      originalError: error,
    });
  }
);

export default axiosClient;
