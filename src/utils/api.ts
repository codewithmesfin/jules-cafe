const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch (e) {
      // Not a JSON error
    }
    throw new Error(errorMessage);
  }

  return response.json();
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
    create: (data: any) => fetcher('/api/menu-items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
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
    getAll: () => fetcher('/api/reservations'),
    getOne: (id: string) => fetcher(`/api/reservations/${id}`),
    create: (data: any) => fetcher('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/reservations/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    getAll: () => fetcher('/api/reviews'),
    getOne: (id: string) => fetcher(`/api/reviews/${id}`),
    create: (data: any) => fetcher('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetcher(`/api/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetcher(`/api/reviews/${id}`, { method: 'DELETE' }),
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
  stats: {
    getDashboard: () => fetcher('/api/stats'),
  },
};
