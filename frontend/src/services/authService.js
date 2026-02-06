import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Get user profile (protected route)
  getProfile: async () => {
    try {
      const response = await api.get('/protected/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Logout (client-side only)
  logout: () => {
    // In a real app, you might want to call a logout endpoint
    // For now, just clear the token
    localStorage.removeItem('careercompass_token');
  }
};

export default authService;