# Authentication API Documentation

## Overview

This document explains how to use the new login and signup APIs for your Franchise CRM application.

## Backend Setup

### 1. API Endpoints

The following API endpoints have been created in the Frappe backend:

#### Login
- **Endpoint**: `/api/method/franchise_crm.api.auth_api.login`
- **Method**: POST
- **Auth Required**: No (allow_guest=True)
- **Parameters**:
  - `email` (string): User email address
  - `password` (string): User password
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "session_id": "your_session_id",
    "user": {
      "email": "user@example.com",
      "full_name": "User Name",
      "user_type": "Website User"
    }
  }
  ```

#### Signup
- **Endpoint**: `/api/method/franchise_crm.api.auth_api.signup`
- **Method**: POST
- **Auth Required**: No (allow_guest=True)
- **Parameters**:
  - `email` (string): User email address
  - `password` (string): User password (min 8 characters)
  - `full_name` (string): User's full name
- **Response**: Same as Login

#### Logout
- **Endpoint**: `/api/method/franchise_crm.api.auth_api.logout`
- **Method**: POST
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```

#### Get Current User
- **Endpoint**: `/api/method/franchise_crm.api.auth_api.get_current_user`
- **Method**: GET
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "status": "success",
    "user": {
      "email": "user@example.com",
      "full_name": "User Name",
      "user_type": "Website User",
      "enabled": true
    },
    "is_authenticated": true
  }
  ```

## Frontend Setup

### 1. Environment Configuration

Create a `.env` file in your frontend root directory (copy from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production:
```env
VITE_API_BASE_URL=https://your-frappe-server.com
```

### 2. Using the Authentication API

#### Method 1: Using the API directly

```typescript
import { authLogin, authSignup, authLogout } from '@/lib/api/auth';

// Login
try {
  const response = await authLogin('user@example.com', 'password123');
  console.log('Login successful:', response);
} catch (error) {
  console.error('Login failed:', error);
}

// Signup
try {
  const response = await authSignup('user@example.com', 'password123', 'User Name');
  console.log('Signup successful:', response);
} catch (error) {
  console.error('Signup failed:', error);
}

// Logout
try {
  await authLogout();
  console.log('Logged out successfully');
} catch (error) {
  console.error('Logout failed:', error);
}
```

#### Method 2: Using the useAuth Hook (Recommended)

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, error, login, signup, logout, clearError } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Navigate to dashboard after successful login
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSignup = async () => {
    try {
      await signup('user@example.com', 'password123', 'User Name');
      // Navigate to dashboard after successful signup
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login page
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {isAuthenticated && user ? (
        <div>
          <p>Welcome, {user.full_name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup}>Signup</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Pre-built Components

Two example pages are provided:

#### LoginPage
- **Location**: `src/pages/LoginPage.tsx`
- **Usage**: Import and use in your router

```typescript
import { LoginPage } from '@/pages/LoginPage';

// In your router configuration
<Route path="/login" element={<LoginPage />} />
```

#### SignupPage
- **Location**: `src/pages/SignupPage.tsx`
- **Usage**: Import and use in your router

```typescript
import { SignupPage } from '@/pages/SignupPage';

// In your router configuration
<Route path="/signup" element={<SignupPage />} />
```

## Key Features

1. **Session Management**: Session ID is automatically stored in localStorage
2. **CSRF Protection**: Automatic CSRF token handling
3. **Error Handling**: Comprehensive error messages and logging
4. **Type Safety**: Full TypeScript support
5. **State Management**: Built-in loading and error states with useAuth hook
6. **Auto-login**: Users are automatically logged in after signup

## Security Features

1. **Password Validation**: Minimum 8 characters required
2. **User Existence Check**: Prevents duplicate account creation
3. **Session Validation**: Backend validates sessions on every request
4. **CSRF Token**: Automatic CSRF token inclusion in all requests
5. **Credentials**: Uses `include` mode for credential handling

## Common Issues and Solutions

### CORS Issues
If you get CORS errors, ensure your Frappe backend has proper CORS configuration:

```python
# In frappe-bench site config
cors_allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
```

### Session Not Persisting
- Ensure cookies are enabled in your browser
- Check that `credentials: 'include'` is set in API calls
- Verify session ID is being stored

### API Not Found
- Ensure the backend has been restarted after adding the API files
- Verify the file path: `/franchise_crm/franchise_crm/api/auth_api.py`
- Check that auth_hooks is enabled in hooks.py

### Login/Signup Fails
- Check browser console for detailed error messages
- Verify email and password format
- Ensure password meets minimum length requirement (8 characters)

## Testing the APIs

### Using Postman or cURL

```bash
# Login
curl -X POST http://localhost:8000/api/method/franchise_crm.api.auth_api.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -b "cookies.txt" \
  -c "cookies.txt"

# Get current user
curl -X GET http://localhost:8000/api/method/franchise_crm.api.auth_api.get_current_user \
  -b "cookies.txt"

# Logout
curl -X POST http://localhost:8000/api/method/franchise_crm.api.auth_api.logout \
  -b "cookies.txt" \
  -c "cookies.txt"
```

## Next Steps

1. **Integrate with Router**: Add authentication guard to protect routes
2. **Create Auth Context**: Use React Context API for global auth state management
3. **Add 2FA**: Implement two-factor authentication
4. **Add Password Reset**: Implement forgot password functionality
5. **Add Social Auth**: Add Google, GitHub, etc. authentication

## Support

For issues or questions about the authentication API, check the logs in your Frappe backend.
