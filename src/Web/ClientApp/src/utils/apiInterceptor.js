import { tokenService } from './tokenService';
import { AuthClient } from '../web-api-client.ts';

// Store the original fetch
const originalFetch = window.fetch;

// Track if we're currently refreshing token
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers when token is refreshed
function onRefreshed(token) {
  refreshSubscribers.map(callback => callback(token));
  refreshSubscribers = [];
}

// Refresh token function
async function refreshToken() {
  try {
    const authClient = new AuthClient();
    const response = await authClient.refreshToken();
    
    if (response && response.token) {
      tokenService.setToken(response.token);
      return response.token;
    }
    
    // If refresh fails, clear auth and redirect to login
    tokenService.clearAuth();
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    tokenService.clearAuth();
    return null;
  }
}

// Setup API interceptor
export function setupApiInterceptor() {
  window.fetch = async function(url, options = {}) {
    // Add authorization header if token exists
    const token = tokenService.getToken();
    if (token && tokenService.isTokenExpired(token)) {
      tokenService.clearAuth();
      return Promise.reject(new Error('Token expired'));
    }
    if (token && !options.headers?.['Authorization']) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    try {
      // Make the request
      let response = await originalFetch(url, options);

      // If unauthorized and we have a token, try to refresh
      if (response.status === 401 && token) {
        if (url.includes('/refresh-token')) {
          tokenService.clearAuth();
          return Promise.reject(new Error('Token expired'));
        }
        if (!isRefreshing) {
          isRefreshing = true;
          
          const newToken = await refreshToken();
          isRefreshing = false;
          
          if (newToken) {
            // Notify all subscribers
            onRefreshed(newToken);
            
            // Retry the original request with new token
            options.headers['Authorization'] = `Bearer ${newToken}`;
            response = await originalFetch(url, options);
          } else {
            refreshSubscribers = [];
          }
        } else {
          // If already refreshing, wait for it to complete
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              options.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(originalFetch(url, options));
            });
          });
        }
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };
}

// Remove interceptor (useful for cleanup)
export function removeApiInterceptor() {
  window.fetch = originalFetch;
}
