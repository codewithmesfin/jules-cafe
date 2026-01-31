import { API_URL } from './api';

export const formatImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'; // Fallback to a food placeholder
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
