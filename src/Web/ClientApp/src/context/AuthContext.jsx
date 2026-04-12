import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { tokenService } from "../utils/tokenService";
import { AuthClient } from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  const isRefreshingRef = useRef(false);
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = tokenService.getToken();
      if (token && !tokenService.isTokenExpired(token)) {
        setIsAuthenticated(true);
      } else {
        tokenService.clearAuth();
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    isRefreshingRef.current = false;
    tokenService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  }, []);

  // Setup token refresh - wrapped in useCallback to avoid recreating
  const setupTokenRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const token = tokenService.getToken();
    if (!token) {
      return;
    }
    // Check if token is expired
    if (tokenService.isTokenExpired(token)) {
      logout();
      return;
    }
    // Get time until expiry in seconds
    const timeUntilExpiry = tokenService.getTimeUntilExpiry(token);
    
    // If token expires in less than 10 seconds, it's too late to refresh reliably
    if (timeUntilExpiry < 10) {
      logout();
      return;
    }
    // Refresh token when 30 seconds left
    const refreshBuffer = 10;
    const refreshIn = Math.max(0, (timeUntilExpiry - refreshBuffer) * 1000);

    refreshTimerRef.current = setTimeout(async () => {
      // Prevent concurrent refresh calls
      if (isRefreshingRef.current) {
        return;
      }
      isRefreshingRef.current = true;
      try {
        const authClient = new AuthClient();
        const result = await authClient.refreshToken();

        if (result && result.token) {
          const newToken = result.token;
          const newTimeUntilExpiry = tokenService.getTimeUntilExpiry(newToken);

          // Check if new token has reasonable lifetime (at least 30 seconds)
          if (newTimeUntilExpiry < 10) {
            logout();
            return;
          }
          // Update token
          tokenService.setToken(newToken);
          // Setup next refresh
          isRefreshingRef.current = false;
          setupTokenRefresh();
        } else {
          console.error("Token refresh failed: No token in response");
          logout();
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        logout();
      } finally {
        isRefreshingRef.current = false;
      }
    }, refreshIn);
  }, [logout]);

  // Setup refresh when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setupTokenRefresh();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [isAuthenticated, setupTokenRefresh]);

  const login = (token) => {
    tokenService.setToken(token);
    setIsAuthenticated(true);
  };

  const updateUser = (newUserInfo) => {
    setUser(newUserInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        isAdmin: isAuthenticated && tokenService.isAdmin(),
        role: isAuthenticated ? tokenService.getUserRole() : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
