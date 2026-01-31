const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export const strapiFetch = async (endpoint: string, options?: RequestInit, request?: Request) => {
  const url = `${STRAPI_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as any) || {}),
  };

  // Forward Authorization header if present in the incoming request
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
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

export const flattenStrapi = (data: any): any => {
  if (!data) return null;

  // Handle Strapi's { data: { id, attributes } } or { data: [{ id, attributes }] }
  if (data.data !== undefined) {
    return flattenStrapi(data.data);
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => flattenStrapi(item));
  }

  // Handle single object with id and attributes
  if (data.id !== undefined || data.attributes !== undefined) {
    const flattened: any = {
      id: data.id?.toString(),
      ...data.attributes,
    };

    // Recursively flatten attributes (for relations)
    if (data.attributes) {
      for (const key in data.attributes) {
        if (typeof data.attributes[key] === 'object' && data.attributes[key] !== null) {
          flattened[key] = flattenStrapi(data.attributes[key]);
        }
      }
    }

    return flattened;
  }

  // Fallback for regular objects (including metadata like 'meta')
  return data;
};
