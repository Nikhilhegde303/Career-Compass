// Token handling utilities
const TOKEN_KEY = 'careercompass_token';

export const authUtils = {
  // Save token to localStorage
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token from localStorage
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remove token (logout)
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authUtils.getToken();
    if (!token) return false;
    
    // Simple check - in real app, you might want to verify token expiration
    return true;
  },

  // Get token for API requests
  getAuthHeader: () => {
    const token = authUtils.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Parse JWT token to get payload (user info)
  // In getUserFromToken function:
getUserFromToken: () => {
  const token = authUtils.getToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    // Map userId to user_id for consistency
    return {
      user_id: decoded.userId,  // Map userId to user_id
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
};

export default authUtils;