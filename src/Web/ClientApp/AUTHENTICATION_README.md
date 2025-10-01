# Token Authentication & Authorization Implementation

## Overview
This implementation provides complete token-based authentication with automatic refresh, user info management, and UI integration.

## Features Implemented

### 1. **Token Management** (`utils/tokenService.js`)
- Store/retrieve access and refresh tokens in localStorage
- Decode JWT tokens to extract user information
- Manage user authentication state
- Clear auth data on logout

### 2. **API Interceptor** (`utils/apiInterceptor.js`)
- Automatically adds Authorization header to all API requests
- Intercepts 401 responses and refreshes tokens
- Queues requests during token refresh
- Redirects to login if refresh fails

### 3. **Auth Context** (`context/AuthContext.jsx`)
- Global authentication state management
- Provides user info across the app
- Handles login/logout actions
- Persists auth state across page reloads

### 4. **Loading Spinner** (`components/LoadingSpinner.jsx`)
- Themed spinner matching your brand colors
- Animated with pulsing rings and glow effects
- Full-screen mode for page transitions
- Optional message display

### 5. **Protected Routes** (`components/ProtectedRoute.jsx`)
- Wrap routes that require authentication
- Auto-redirect to login if not authenticated
- Shows loading spinner during auth check

## How It Works

### Login Flow:
1. User submits credentials
2. `useLogin` hook sends request to backend
3. Backend returns JWT token
4. Token is stored in localStorage
5. User info is extracted from token and stored
6. Auth context updates with user data
7. Header displays user avatar and info
8. User is redirected to home page

### API Authorization:
1. API interceptor adds `Authorization: Bearer <token>` to every request
2. Backend validates token on protected endpoints
3. If token expired (401 response):
   - Interceptor calls refresh token endpoint
   - New token is stored
   - Original request retries with new token
4. If refresh fails, user is logged out and redirected to login

### Token Refresh:
- Happens automatically on 401 responses
- Uses refresh token endpoint: `GET /api/Auth/refresh-token`
- Multiple simultaneous requests wait for single refresh
- Updates all queued requests with new token

## Usage Examples

### Protect a Route:
\`\`\`jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
\`\`\`

### Access User Info in Components:
\`\`\`jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome {user?.fullName}</p>
      <img src={user?.avatar} alt="avatar" />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
\`\`\`

### Show Loading Spinner:
\`\`\`jsx
import LoadingSpinner from './components/LoadingSpinner';

// Full screen with message
<LoadingSpinner fullScreen message="Loading..." />

// Inline spinner
<LoadingSpinner size={40} />
\`\`\`

## Backend Requirements

### The backend should:

1. **Login Endpoint** (`POST /api/Auth/login`)
   - Accept: `{ email, password }`
   - Return: `{ token: "jwt_token_here" }`
   - Token should contain claims: nameid, name, role, fullName, picture, lastlogin

2. **Refresh Token Endpoint** (`GET /api/Auth/refresh-token`)
   - Require: Authorization header with expired/valid token
   - Return: `{ token: "new_jwt_token_here" }`
   - OR return 401 if refresh token is invalid/expired

3. **Protected Endpoints**
   - Add `[Authorize]` attribute
   - Validate JWT token from Authorization header
   - Return 401 if token is invalid/expired

## Token Structure

The JWT token should contain these claims:
\`\`\`json
{
  "nameid": "user-id",
  "name": "user@email.com",
  "role": "User",
  "fullName": "John Doe",
  "picture": "avatar-url",
  "lastlogin": "2025-01-01T00:00:00Z",
  "exp": 1735689600
}
\`\`\`

## Files Modified/Created

### Created:
- `src/utils/tokenService.js` - Token management
- `src/utils/apiInterceptor.js` - API request interceptor
- `src/context/AuthContext.jsx` - Auth state management
- `src/components/LoadingSpinner.jsx` - Loading UI
- `src/components/ProtectedRoute.jsx` - Route protection

### Modified:
- `src/index.jsx` - Added AuthProvider and API interceptor setup
- `src/hooks/useLogin.js` - Store token and redirect on success
- `src/components/header/Header.jsx` - Display user info from context
- `src/components/header/drop-down-profile/DropDownProfile.jsx` - Handle logout
- `src/components/header/drop-down-profile/ProfileHeader.jsx` - Display user details
- `src/features/guest/auth/login/Login.jsx` - Show spinner while logging in

## Testing

1. **Login Test:**
   - Go to `/login`
   - Enter credentials
   - Should see spinner
   - Should redirect to home
   - Header should show user avatar/name

2. **Token Persistence:**
   - Login successfully
   - Refresh page
   - Should remain logged in
   - User info should persist

3. **Protected Route:**
   - Logout
   - Try to access protected route
   - Should redirect to login

4. **Auto Refresh:**
   - Wait for token to expire
   - Make an API call
   - Should auto-refresh token
   - Request should succeed

5. **Logout:**
   - Click profile dropdown
   - Click Sign Out
   - Should clear tokens
   - Should redirect to home
   - Header should show login/signup buttons
