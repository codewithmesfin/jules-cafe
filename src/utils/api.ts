export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const getRetryDelay = (attempt: number): number => {
  const delay = BASE_DELAY * Math.pow(2, attempt);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, 30000);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetcher = async (url: string, options?: RequestInit, retryCount = 0): Promise<any> => {
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

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    const delay = getRetryDelay(retryCount);
    await sleep(delay);
    return fetcher(url, options, retryCount + 1);
  }

  if (response.status === 423) {
    if (typeof window !== 'undefined') {
      window.location.href = '/inactive';
    }
    throw new Error('Account inactive.');
  }

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch (e) {}
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
  public: {
    getBusiness: (id: string) => fetcher(`/public/business/${id}`),
    getProducts: (businessId: string) => fetcher(`/public/products?business_id=${businessId}`),
    getCategories: (businessId: string) => fetcher(`/public/categories?business_id=${businessId}`),
  },
  business: {
    setup: (data: any) => fetcher('/api/business/setup', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetcher('/api/business/me'),
    update: (id: string, data: any) => fetcher(`/api/business/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  products: {
    getAll: () => fetcher('/api/products'),
    getOne: (id: string) => fetcher(`/api/products/${id}`),
    create: (data: any) => fetcher('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    getAll: () => fetcher('/api/categories'),
    getOne: (id: string) => fetcher(`/api/categories/${id}`),
    create: (data: any) => fetcher('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  ingredients: {
    getAll: () => fetcher('/api/ingredients'),
    getOne: (id: string) => fetcher(`/api/ingredients/${id}`),
    create: (data: any) => fetcher('/api/ingredients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/ingredients/${id}`, { method: 'DELETE' }),
  },
  recipes: {
    getAll: () => fetcher('/api/recipes'),
    getOne: (id: string) => fetcher(`/api/recipes/${id}`),
    create: (data: any) => fetcher('/api/recipes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/recipes/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    getAll: () => fetcher('/api/inventory'),
    getTransactions: () => fetcher('/api/inventory/transactions'),
    create: (data: any) => fetcher('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  orders: {
    getAll: () => fetcher('/api/orders'),
    getOne: (id: string) => fetcher(`/api/orders/${id}`),
    getItems: (id: string) => fetcher(`/api/orders/${id}/items`),
    create: (data: any) => fetcher('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  users: {
    getAll: () => fetcher('/api/users'),
    getOne: (id: string) => fetcher(`/api/users/${id}`),
    createStaff: (data: any) => fetcher('/api/users/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/users/${id}`, { method: 'DELETE' }),
  },
  tables: {
    getAll: () => fetcher('/api/tables'),
    create: (data: any) => fetcher('/api/tables', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/tables/${id}`, { method: 'DELETE' }),
  },
  customers: {
    getAll: () => fetcher('/api/customers'),
    create: (data: any) => fetcher('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/customers/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    getAll: () => fetcher('/api/tasks'),
    create: (data: any) => fetcher('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  cashSessions: {
    getAll: () => fetcher('/api/cash-sessions'),
    create: (data: any) => fetcher('/api/cash-sessions', { method: 'POST', body: JSON.stringify(data) }),
    close: (id: string, data: any) => fetcher(`/api/cash-sessions/${id}/close`, { method: 'POST', body: JSON.stringify(data) }),
  },
  shifts: {
    getAll: () => fetcher('/api/shifts'),
    clockIn: () => fetcher('/api/shifts/clock-in', { method: 'POST' }),
    clockOut: () => fetcher('/api/shifts/clock-out', { method: 'POST' }),
  },
  analytics: {
    getSales: (params?: string) => fetcher(`/api/analytics/sales${params ? `?${params}` : ''}`),
    getProducts: (params?: string) => fetcher(`/api/analytics/products${params ? `?${params}` : ''}`),
    getStock: (params?: string) => fetcher(`/api/analytics/stock${params ? `?${params}` : ''}`),
  },
  auth: {
    login: (data: any) => fetcher('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    signup: (data: any) => fetcher('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => fetcher('/api/auth/me'),
    updateProfile: (data: any) => fetcher('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  }
};
