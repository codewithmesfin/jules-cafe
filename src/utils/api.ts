export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const fetcher = async (url: string, options?: RequestInit): Promise<any> => {
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

  if (response.status === 423) {
    if (typeof window !== 'undefined') window.location.href = '/inactive';
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
  try { return JSON.parse(text); } catch (e) { return text; }
};

export const api = {
  public: {
    getBusiness: (id: string) => fetcher(`/public/business/${id}`),
    getProducts: (businessId: string) => fetcher(`/public/products?business_id=${businessId}`),
    getCategories: (businessId: string) => fetcher(`/public/categories?business_id=${businessId}`),
  },
  menu: {
    getAll: () => fetcher('/api/menu'),
    getOne: (id: string) => fetcher(`/api/menu/${id}`),
    create: (data: any) => fetcher('/api/menu', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/menu/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/menu/${id}`, { method: 'DELETE' }),
  },
  business: {
    setup: (data: any) => fetcher('/api/business/setup', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetcher('/api/business/me'),
    getMyBusinesses: () => fetcher('/api/business/my-businesses'),
    switch: (businessId: string) => fetcher('/api/business/switch', { method: 'POST', body: JSON.stringify({ business_id: businessId }) }),
    update: (id: string, data: any) => fetcher(`/api/business/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    create: (data: any) => fetcher('/api/business', { method: 'POST', body: JSON.stringify(data) }),
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
    delete: (id: string) => fetcher(`/api/inventory/${id}`, { method: 'DELETE' }),
    addStock: (data: any) => fetcher('/api/inventory/add-stock', { method: 'POST', body: JSON.stringify(data) }),
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
    updatePassword: (id: string, data: any) => fetcher(`/api/users/${id}/password`, { method: 'PATCH', body: JSON.stringify(data) }),
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
  },
  settings: {
    getUnits: () => fetcher('/api/settings/units'),
    createUnit: (data: any) => fetcher('/api/settings/units', { method: 'POST', body: JSON.stringify(data) }),
    updateUnit: (id: string, data: any) => fetcher(`/api/settings/units/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteUnit: (id: string) => fetcher(`/api/settings/units/${id}`, { method: 'DELETE' }),
    getConversions: () => fetcher('/api/settings/conversions'),
    createConversion: (data: any) => fetcher('/api/settings/conversions', { method: 'POST', body: JSON.stringify(data) }),
    updateConversion: (id: string, data: any) => fetcher(`/api/settings/conversions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteConversion: (id: string) => fetcher(`/api/settings/conversions/${id}`, { method: 'DELETE' }),
  },
  upload: {
    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
  }
};
