// Token management service
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

export const tokenService = {
  // Get access token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set access token
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Set refresh token
  setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // Get user info
  getUserInfo() {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Set user info
  setUserInfo(userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  // Remove all tokens and user info
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Decode JWT token to get user info
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Extract user info from token
  extractUserInfoFromToken(token) {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.nameid || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      // Try email claim first, fallback to name claim, then full namespace
      email: decoded.email || 
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            decoded.name || 
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      username: decoded.name || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      fullName: decoded.fullName || '',
      role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      avatar: decoded.picture || '',
      lastLogin: decoded.lastlogin || '',
    };
  },

  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  },

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(token) {
    const expiry = this.getTokenExpiry(token);
    if (expiry) {
      const now = new Date();
      const timeLeft = expiry.getTime() - now.getTime();
      return Math.max(0, Math.floor(timeLeft / 1000));
    }
    return 0;
  },

  isTokenExpired(token) {
    return this.getTimeUntilExpiry(token) <= 0;
  }
};
