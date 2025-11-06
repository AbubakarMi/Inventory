const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  console.log('[API] Request:', { url, method: options.method || 'GET' });

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[API] Request timeout after 30s, aborting...');
      controller.abort();
    }, 30000); // 30 second timeout

    console.log('[API] Sending fetch request...');
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      credentials: 'same-origin',
    });

    clearTimeout(timeoutId);

    console.log('[API] Response received:', { status: response.status, ok: response.ok });

    // Handle empty responses
    const text = await response.text();
    console.log('[API] Response body length:', text.length);
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      console.error('[API] Error response:', data);
      throw new ApiError(
        data.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    console.log('[API] Success:', data);
    return data as T;
  } catch (error) {
    console.error('[API] Request failed:', error);

    // Handle abort errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[API] Request was aborted due to timeout');
      throw new ApiError(
        'Request timeout - please try again',
        408
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    console.error('[API] Network or parsing error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error - please check your connection',
      0
    );
  }
}

// Helper methods
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Auth specific methods
export const authApi = {
  login: async (email: string, password: string) => {
    console.log('[AUTH-API] Sending login request to /auth/login');
    console.log('[AUTH-API] Credentials:', { email, passwordLength: password.length });
    try {
      const response = await api.post<{
        user: any;
        token: string;
        message: string;
      }>('/auth/login', { email, password });

      console.log('[AUTH-API] Login successful, response received:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        message: response.message
      });

      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        console.log('[AUTH-API] Token stored in localStorage');
      }

      return response;
    } catch (error) {
      console.error('[AUTH-API] Login request failed:', error);
      throw error;
    }
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post<{
      user: any;
      token: string;
      message: string;
    }>('/auth/register', data);

    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
    }

    return response;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear token even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  },

  getCurrentUser: async () => {
    return api.get<{ user: any }>('/auth/me');
  },
};

export { ApiError };
