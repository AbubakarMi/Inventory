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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
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
    const response = await api.post<{
      user: any;
      token: string;
      message: string;
    }>('/auth/login', { email, password });

    // Store token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
    }

    return response;
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
