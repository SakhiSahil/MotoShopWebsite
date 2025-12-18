// Helper to get full image URL
const API_BASE_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = API_BASE_URL.replace('/api', '');

export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it starts with /uploads, prefix with backend URL
  if (path.startsWith('/uploads')) {
    return `${BACKEND_URL}${path}`;
  }
  
  // Otherwise return as-is (could be a local asset)
  return path;
};

