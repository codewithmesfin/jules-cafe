const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export const strapiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${STRAPI_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Strapi API error';
    try {
      const error = await response.json();
      errorMessage = error.error?.message || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const flattenStrapi = (data: any) => {
  if (!data || !data.data) return data;

  if (Array.isArray(data.data)) {
    return data.data.map((item: any) => ({
      id: item.id,
      ...item.attributes,
    }));
  }

  return {
    id: data.data.id,
    ...data.data.attributes,
  };
};
