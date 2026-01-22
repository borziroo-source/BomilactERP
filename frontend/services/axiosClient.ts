import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Centralized Axios client for BomilactERP API calls
 * 
 * Features:
 * - Automatic base URL configuration from VITE_API_URL
 * - Request interceptor for authentication tokens
 * - Response interceptor for standardized error handling
 * - Automatic timeout configuration
 */

// Get API base URL from environment variable, fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create Axios instance with default configuration
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Adds authentication token to requests if available
 * - Can be extended with other common request modifications
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from localStorage (if authentication is implemented)
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles common error scenarios
 * - Provides standardized error messages
 * - Can trigger global error notifications
 */
axiosClient.interceptors.response.use(
  (response) => {
    // Return response data directly for successful requests
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string };
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Invalid request parameters');
          break;
        case 401:
          console.error('Unauthorized:', 'Please log in again');
          // Optional: Redirect to login or clear auth token
          localStorage.removeItem('authToken');
          break;
        case 403:
          console.error('Forbidden:', 'You do not have permission to access this resource');
          break;
        case 404:
          console.error('Not Found:', data.message || 'Resource not found');
          break;
        case 409:
          console.error('Conflict:', data.message || 'Data conflict occurred');
          break;
        case 422:
          console.error('Validation Error:', data.message || 'Invalid data provided');
          break;
        case 500:
          console.error('Server Error:', 'Internal server error occurred');
          break;
        default:
          console.error(`Error ${status}:`, data.message || 'An error occurred');
      }
      
      // Create user-friendly error message
      const errorMessage = data.message || `Request failed with status ${status}`;
      return Promise.reject(new Error(errorMessage));
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', 'No response from server');
      return Promise.reject(new Error('Network error: Unable to connect to server'));
      
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
