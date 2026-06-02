/**
 * Local storage utilities for authentication
 */

const PREFIX = 'franchise_crm_auth_';

interface StoredAuthData {
  session_id: string;
  user_email: string;
  user_name: string;
  timestamp: number;
}

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (sessionId: string, email: string, fullName: string) => {
  const authData: StoredAuthData = {
    session_id: sessionId,
    user_email: email,
    user_name: fullName,
    timestamp: Date.now(),
  };
  localStorage.setItem(`${PREFIX}session`, JSON.stringify(authData));
};

/**
 * Get authentication data from localStorage
 */
export const getAuthData = (): StoredAuthData | null => {
  const data = localStorage.getItem(`${PREFIX}session`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Get stored session ID
 */
export const getStoredSessionId = (): string | null => {
  const authData = getAuthData();
  return authData?.session_id || null;
};

/**
 * Check if session is still valid (optional - add expiry logic if needed)
 */
export const isSessionValid = (maxAgeMinutes: number = 1440): boolean => {
  const authData = getAuthData();
  if (!authData) return false;
  
  const ageMinutes = (Date.now() - authData.timestamp) / (1000 * 60);
  return ageMinutes < maxAgeMinutes;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem(`${PREFIX}session`);
};

/**
 * Get all localStorage keys related to auth
 */
export const getAllAuthKeys = (): string[] => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Clear all authentication data comprehensively
 */
export const clearAllAuthData = () => {
  getAllAuthKeys().forEach((key) => localStorage.removeItem(key));
};

/**
 * Debug function to inspect stored auth data
 */
export const debugAuthStorage = () => {
  console.log('🔐 Auth Storage Debug:');
  console.log('Session ID:', getStoredSessionId());
  console.log('Auth Data:', getAuthData());
  console.log('Is Valid:', isSessionValid());
  console.log('All Auth Keys:', getAllAuthKeys());
};
