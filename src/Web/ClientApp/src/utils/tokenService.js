// Token management service
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REQUIRES_PASSWORD_CHANGE_KEY = 'requires_password_change';
const IS_FIRST_LOGIN_KEY = 'is_first_login';

export const tokenService = {
  // Get access token
  getToken() {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;
    try {
      const parsed = JSON.parse(tokenData);
      return parsed.value || tokenData;
    } catch {
      return tokenData;
    }
  },

  // Set access token
  setToken(token) {
    const tokenData = {
      createdAt: Date.now(),
      name: 'auth:jwt:token',
      ownerStrategyName: 'email',
      value: token,
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));

    // Extract and store requiresPasswordChange from token
    const decoded = this.decodeToken(token);
    if (decoded && decoded.requiresPasswordChange !== undefined) {
      this.setRequiresPasswordChange(decoded.requiresPasswordChange === 'true' || decoded.requiresPasswordChange === true);
    }
    // Extract and store isFirstLogin from token
    if (decoded && decoded.isFirstLogin !== undefined) {
      localStorage.setItem(IS_FIRST_LOGIN_KEY, JSON.stringify(decoded.isFirstLogin === 'true' || decoded.isFirstLogin === true));
    }
  },

  // Get refresh token
  getRefreshToken() {
    const tokenData = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!tokenData) return null;
    try {
      const parsed = JSON.parse(tokenData);
      return parsed.value || tokenData;
    } catch {
      return tokenData;
    }
  },

  // Set refresh token
  setRefreshToken(token) {
    const tokenData = {
      createdAt: Date.now(),
      name: 'auth:jwt:refresh-token',
      ownerStrategyName: 'email',
      value: token,
    };
    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(tokenData));
  },

  // Remove all tokens
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REQUIRES_PASSWORD_CHANGE_KEY);
    localStorage.removeItem(IS_FIRST_LOGIN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Set requires password change flag
  setRequiresPasswordChange(value) {
    localStorage.setItem(REQUIRES_PASSWORD_CHANGE_KEY, JSON.stringify(value));
  },

  // Get requires password change flag
  getRequiresPasswordChange() {
    const value = localStorage.getItem(REQUIRES_PASSWORD_CHANGE_KEY);
    if (value === null) return false;
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  },

  // Clear requires password change flag
  clearRequiresPasswordChange() {
    localStorage.removeItem(REQUIRES_PASSWORD_CHANGE_KEY);
  },

  // Get isFirstLogin flag (set once on login, read by Homepage)
  getIsFirstLogin() {
    const value = localStorage.getItem(IS_FIRST_LOGIN_KEY);
    if (value === null) return false;
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  },

  // Clear isFirstLogin flag after redirect
  clearIsFirstLogin() {
    localStorage.removeItem(IS_FIRST_LOGIN_KEY);
  },

  // Get default password from token (for first login)
  getDefaultPassword() {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.defaultPassword || null;
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
  },

  // Get user role from token
  getUserRole() {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    // JWT claims có thể chứa role dưới tên: role, roles, 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    return decoded?.role || decoded?.roles || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
  },

  // Get current user ID from token (sub claim)
  getUserId() {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    return decoded?.sub || decoded?.nameid || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
  },

  // Check if user is admin
  isAdmin() {
    const role = this.getUserRole();
    if (!role) return false;

    // Handle both string and array roles
    if (Array.isArray(role)) {
      return role.some(r => r?.toLowerCase() === 'admin' || r?.toLowerCase() === 'administrator');
    }

    return role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator';
  },
};
