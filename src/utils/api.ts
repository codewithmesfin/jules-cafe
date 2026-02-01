export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const fetcher = async (url: string, options?: RequestInit) => {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  const isFormData = options?.body instanceof FormData;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch (e) {
      // Not a JSON error
      try {
        errorMessage = await response.text() || errorMessage;
      } catch (textError) {
        // Fallback to default message
      }
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
};

export const api = {
  branches: {
    getAll: () => fetcher('/api/branches'),
    getOne: (id: string) => fetcher(`/api/branches/${id}`),
    create: (data: any) => fetcher('/api/branches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/branches/${id}`, { method: 'DELETE' }),
  },
  tables: {
    getAll: () => fetcher('/api/tables'),
    getOne: (id: string) => fetcher(`/api/tables/${id}`),
    create: (data: any) => fetcher('/api/tables', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/tables/${id}`, { method: 'DELETE' }),
  },
  users: {
    getAll: () => fetcher('/api/users'),
    getOne: (id: string) => fetcher(`/api/users/${id}`),
    create: (data: any) => fetcher('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/users/${id}`, { method: 'DELETE' }),
  },
  categories: {
    getAll: () => fetcher('/api/categories'),
    getOne: (id: string) => fetcher(`/api/categories/${id}`),
    create: (data: any) => fetcher('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  menuItems: {
    getAll: () => fetcher('/api/menu-items'),
    getOne: (id: string) => fetcher(`/api/menu-items/${id}`),
    create: (data: any) => fetcher('/api/menu-items', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetcher(`/api/menu-items/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id: string) => fetcher(`/api/menu-items/${id}`, { method: 'DELETE' }),
  },
  orders: {
    getAll: () => fetcher('/api/orders'),
    getOne: (id: string) => fetcher(`/api/orders/${id}`),
    create: (data: any) => fetcher('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/orders/${id}`, { method: 'DELETE' }),
  },
  reservations: {
    getAll: (params?: string) => fetcher(`/api/reservations${params ? `?${params}` : ''}`),
    getOne: (id: string) => fetcher(`/api/reservations/${id}`),
    create: (data: any) => fetcher('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/reservations/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    getAll: () => fetcher('/api/inventory'),
    getOne: (id: string) => fetcher(`/api/inventory/${id}`),
    create: (data: any) => fetcher('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/inventory/${id}`, { method: 'DELETE' }),
  },
  recipes: {
    getAll: () => fetcher('/api/recipes'),
    getOne: (id: string) => fetcher(`/api/recipes/${id}`),
    create: (data: any) => fetcher('/api/recipes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/recipes/${id}`, { method: 'DELETE' }),
  },
  branchMenuItems: {
    getAll: () => fetcher('/api/branch-menu-items'),
    getOne: (id: string) => fetcher(`/api/branch-menu-items/${id}`),
    create: (data: any) => fetcher('/api/branch-menu-items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/branch-menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/branch-menu-items/${id}`, { method: 'DELETE' }),
  },
  stats: {
    getDashboard: (params?: string) => fetcher(`/api/stats${params ? `?${params}` : ''}`),
    getSales: (params?: string) => fetcher(`/api/analytics/sales${params ? `?${params}` : ''}`),
    getStock: (params?: string) => fetcher(`/api/analytics/stock${params ? `?${params}` : ''}`),
    getProducts: (params?: string) => fetcher(`/api/analytics/products${params ? `?${params}` : ''}`),
    getBranches: (params?: string) => fetcher(`/api/analytics/branches${params ? `?${params}` : ''}`),
  },
  items: {
    getAll: () => fetcher('/api/items'),
    getOne: (id: string) => fetcher(`/api/items/${id}`),
    getByType: (type: string) => fetcher(`/api/items/type/${type}`),
    create: (data: any) => fetcher('/api/items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/items/${id}`, { method: 'DELETE' }),
  },
  auth: {
    signup: (data: any) => fetcher('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (email: string) => fetcher('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token: string, data: any) => fetcher(`/api/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(data) }),
  }
};
