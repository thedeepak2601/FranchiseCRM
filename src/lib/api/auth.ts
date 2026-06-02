/**
 * API client for authentication endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface LoginResponse {
  status: string;
  message: string;
  session_id: string;
  user: {
    email: string;
    full_name: string;
    user_type: string;
  };
}

interface SignupResponse {
  status: string;
  message: string;
  session_id: string;
  user: {
    email: string;
    full_name: string;
    user_type: string;
  };
}

interface LogoutResponse {
  status: string;
  message: string;
}

interface CurrentUserResponse {
  status: string;
  user: {
    email: string;
    full_name: string;
    user_type: string;
    enabled: boolean;
  } | null;
  is_authenticated: boolean;
  error?: string;
}

/**
 * Login user with email and password
 */
export const authLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/method/franchise_crm.api.auth_api.login`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    if (data.message) {
      const result = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      // Store session ID in localStorage
      if (result.session_id) {
        localStorage.setItem('session_id', result.session_id);
      }
      return result;
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Sign up new user
 */
export const authSignup = async (
  email: string,
  password: string,
  fullName: string
): Promise<SignupResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/method/franchise_crm.api.auth_api.signup`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    if (data.message) {
      const result = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      // Store session ID in localStorage
      if (result.session_id) {
        localStorage.setItem('session_id', result.session_id);
      }
      return result;
    }
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Logout current user
 */
export const authLogout = async (): Promise<LogoutResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/method/franchise_crm.api.auth_api.logout`, {
      method: 'POST',
      headers: buildJsonHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    // Clear session ID from localStorage
    localStorage.removeItem('session_id');

    const data = await response.json();
    if (data.message) {
      const result = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      return result;
    }
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/method/franchise_crm.api.auth_api.get_current_user`, {
      method: 'GET',
      headers: buildJsonHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    const data = await response.json();
    if (data.message) {
      const result = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
      return result;
    }
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      status: 'error',
      user: null,
      is_authenticated: false,
      error: String(error),
    };
  }
};

/**
 * Get CSRF token from cookie
 */
function buildJsonHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-Frappe-CSRF-Token'] = csrfToken;
  }
  return headers;
}

function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Get session ID from localStorage or cookies
 */
export const getSessionId = (): string | null => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = getCookie('sid');
  }
  return sessionId;
};

/**
 * Get cookie by name
 */
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
