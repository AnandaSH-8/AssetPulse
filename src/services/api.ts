import { supabase } from '@/integrations/supabase/client';

// The Supabase URL must never be `undefined` at runtime: env vars are inlined at
// build time and can be missing in some deployments, which made requests hit the
// SPA itself and return HTML instead of JSON.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://xkyhvkuahdvvlwjgnipt.supabase.co';

const API_BASE_URL = `${SUPABASE_URL}/functions/v1`;

// Helper function to get auth token
const getAuthToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
};

const doFetch = (endpoint: string, options: RequestInit, token?: string) =>
  fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

// Multiple screens fire requests in parallel. Without de-duplication each 401
// triggers its own refreshSession(), and the losing calls end up using an
// already-rotated refresh token — which fails and signs the user out (blank screen).
let refreshPromise: Promise<string | undefined> | null = null;

const refreshOnce = async () => {
  if (!refreshPromise) {
    refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data, error }) => (error ? undefined : data.session?.access_token))
      .catch(() => undefined)
      .finally(() => {
        // Allow a later, genuinely new refresh cycle.
        setTimeout(() => {
          refreshPromise = null;
        }, 1000);
      });
  }
  return refreshPromise;
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  let token = await getAuthToken();

  // The session may still be hydrating right after a reload; refresh instead of
  // firing a guaranteed-401 request with an empty Authorization header.
  if (!token) {
    token = await refreshOnce();
    if (!token) throw new Error('Your session has expired. Please sign in again.');
  }

  let response = await doFetch(endpoint, options, token);

  // A revoked/expired access token yields 401 "Invalid token". Try one shared
  // refresh before surfacing the error; if the session is truly gone, sign out.
  if (response.status === 401) {
    const newToken = await refreshOnce();
    if (newToken) {
      response = await doFetch(endpoint, options, newToken);
    }
    if (response.status === 401) {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      throw new Error('Your session has expired. Please sign in again.');
    }
  }


  if (!response.ok) {
    const text = await response.text();
    let message = 'API request failed';
    try {
      message = JSON.parse(text).error || message;
    } catch {
      // Non-JSON response (e.g. HTML) — keep the generic message.
    }
    throw new Error(message);
  }

  return response.json();
};

export const authAPI = {
  // Sign up a new user
  signUp: async (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => {
    const response = await fetch(`${API_BASE_URL}/auth-api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }

    return response.json();
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth-api/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }

    return response.json();
  },

  // Sign out user
  signOut: async () => {
    return apiCall('/auth-api/signout', { method: 'POST' });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiCall('/auth-api/me');
  },
};

// Financial API - Interacts with 'financial_particulars' table
export const financialAPI = {
  // Get all financial particulars from 'financial_particulars' table
  getAll: async () => {
    return apiCall('/financial-api/all');
  },

  // Get financial statistics from 'financial_particulars' table
  getStats: async () => {
    return apiCall('/financial-api/stats');
  },

  // Get single financial particular from 'financial_particulars' table
  getById: async (id: string) => {
    return apiCall(`/financial-api/${id}`);
  },

  // Create new financial particular in 'financial_particulars' table
  create: async (data: {
    category: string;
    description?: string;
    amount: number;
    cash?: number;
    investment?: number;
    current_value?: number;
    month?: string;
    month_number?: number;
    year?: number;
  }) => {
    return apiCall('/financial-api/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update financial particular in 'financial_particulars' table
  update: async (
    id: string,
    data: {
      category?: string;
      description?: string;
      amount?: number;
      cash?: number;
      investment?: number;
      current_value?: number;
      month?: string;
      month_number?: number;
    },
  ) => {
    return apiCall(`/financial-api/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete financial particular from 'financial_particulars' table
  delete: async (id: string) => {
    return apiCall(`/financial-api/${id}`, {
      method: 'DELETE',
    });
  },

  // Clear all financial data from 'financial_particulars' table (keep login credentials)
  clearAll: async () => {
    return apiCall('/financial-api/clear-all', {
      method: 'DELETE',
    });
  },

  // Get unique titles from 'financial_particulars' table for autocomplete
  getTitles: async () => {
    return apiCall('/financial-api/titles');
  },
};

// User API - Interacts with 'profiles' and 'financial_particulars' tables
export const userAPI = {
  // Get user profile from 'profiles' table
  getProfile: async () => {
    return apiCall('/user-api/profile');
  },

  // Update user profile in 'profiles' table
  updateProfile: async (data: { name?: string; username?: string }) => {
    return apiCall('/user-api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user account from 'profiles' and 'financial_particulars' tables
  deleteAccount: async () => {
    return apiCall('/user-api/delete-account', {
      method: 'DELETE',
    });
  },
};
