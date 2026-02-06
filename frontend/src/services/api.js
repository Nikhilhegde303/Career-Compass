import axios from 'axios';
import { authUtils } from '../utils/auth';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired/invalid)
    if (error.response?.status === 401) {
      authUtils.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;