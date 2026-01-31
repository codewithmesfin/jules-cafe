import { API_URL } from './api';

export const formatImageUrl = (url: string | undefined): string => {
  if (!url) return '/placeholder-food.jpg'; // Assuming there's a placeholder
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
