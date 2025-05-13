import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/authSlice';

// Determine API base URL based on current environment
let baseURL;
if (window.location.hostname === 'localhost') {
  baseURL = 'http://localhost:3001/api';
} else if (window.location.hostname === 'clock.mmcwellness.ca') {
  baseURL = 'https://clock.mmcwellness.ca/api';
} else {
  // Docker environment or other environments
  baseURL = '/api';
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Dispatch logout action to clear Redux state
      store.dispatch(logout());

      // Only redirect to login if we're not already there
      if (!window.location.pathname.includes('/login')) {
        // Use replace instead of href to avoid adding to browser history
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
