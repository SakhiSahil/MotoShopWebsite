// API configuration
//
// IMPORTANT:
// - In Lovable preview, `localhost` points to the preview container, NOT your own machine.
// - So you must use a publicly reachable backend URL (e.g. https://your-app.fly.dev/api).
//
// Recommended env format:
//   VITE_API_URL=https://your-backend-domain.com/api
// (Do NOT use localhost when testing inside Lovable preview.)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Auth token management
let authToken: string | null = localStorage.getItem('admin_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
};

export const getAuthToken = () => authToken;

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  verify: () => apiRequest('/auth/verify'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Products API
export const productsAPI = {
  getAll: () => apiRequest('/products'),
  getById: (id: string) => apiRequest(`/products/${id}`),
  create: (data: FormData) =>
    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  update: (id: string, data: FormData) =>
    fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  delete: (id: string) =>
    apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// Settings API
export const settingsAPI = {
  getAll: () => apiRequest('/settings'),
  getStats: () => apiRequest('/settings/stats'),
  update: (key: string, value: string, value_fa: string) =>
    apiRequest(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, value_fa }),
    }),
  updateAll: (settings: Record<string, { value: string; value_fa: string }>) =>
    apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  createStat: (data: { label: string; label_fa: string; value: string; icon: string; sort_order?: number }) =>
    apiRequest('/settings/stats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStat: (id: number, data: { label: string; label_fa: string; value: string; icon: string; sort_order?: number }) =>
    apiRequest(`/settings/stats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteStat: (id: number) =>
    apiRequest(`/settings/stats/${id}`, { method: 'DELETE' }),
};

// Brands API
export const brandsAPI = {
  getAll: () => apiRequest('/brands'),
  getAllAdmin: () => apiRequest('/brands/all'),
  create: (data: FormData) =>
    fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  update: (id: number, data: FormData) =>
    fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  delete: (id: number) =>
    apiRequest(`/brands/${id}`, { method: 'DELETE' }),
};

// Slides API
export const slidesAPI = {
  getAll: () => apiRequest('/slides'),
  getAllAdmin: () => apiRequest('/slides/all'),
  create: (data: FormData) =>
    fetch(`${API_BASE_URL}/slides`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  update: (id: number, data: FormData) =>
    fetch(`${API_BASE_URL}/slides/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: data,
    }).then((r) => r.json()),
  delete: (id: number) =>
    apiRequest(`/slides/${id}`, { method: 'DELETE' }),
};

// Pages API
export const pagesAPI = {
  getAll: () => apiRequest('/pages'),
  getById: (id: string) => apiRequest(`/pages/${id}`),
  update: (id: string, data: { title: string; title_fa: string; content: string; content_fa: string; meta_description?: string; meta_description_fa?: string }) =>
    apiRequest(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),
  create: (data: { name: string; name_fa: string; value: string; sort_order?: number; active?: boolean }) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; name_fa?: string; value?: string; sort_order?: number; active?: boolean }) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// Dealers API
export const dealersAPI = {
  getAll: () => apiRequest('/dealers'),
  getAllAdmin: () => apiRequest('/dealers/all'),
  create: (data: { name: string; name_fa: string; address?: string; address_fa?: string; phone?: string; email?: string; hours?: string; hours_fa?: string; sort_order?: number; active?: boolean }) =>
    apiRequest('/dealers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<{ name: string; name_fa: string; address: string; address_fa: string; phone: string; email: string; hours: string; hours_fa: string; sort_order: number; active: boolean }>) =>
    apiRequest(`/dealers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/dealers/${id}`, { method: 'DELETE' }),
};

// Contact API
export const contactAPI = {
  getSettings: () => apiRequest('/contact/settings'),
  updateSettings: (settings: Record<string, { value: string; value_fa: string }>) =>
    apiRequest('/contact/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getMessages: () => apiRequest('/contact/messages'),
  sendMessage: (data: { name: string; email?: string; phone?: string; message: string; product_id?: number; product_name?: string }) =>
    apiRequest('/contact/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  markAsRead: (id: number) =>
    apiRequest(`/contact/messages/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id: number) =>
    apiRequest(`/contact/messages/${id}`, { method: 'DELETE' }),
};

// About API
export const aboutAPI = {
  get: () => apiRequest('/about/content'),
  update: (data: { title: string; title_fa: string; content: string; content_fa: string; image?: string; years_experience?: string }) =>
    apiRequest('/about/content', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getValues: () => apiRequest('/about/values'),
  getTeam: () => apiRequest('/about/team'),
};

// FAQ API
export const faqAPI = {
  getAll: () => apiRequest('/faq'),
  getAllAdmin: () => apiRequest('/faq/all'),
  create: (data: { question: string; question_fa: string; answer: string; answer_fa: string; sort_order?: number; active?: boolean }) =>
    apiRequest('/faq', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { question?: string; question_fa?: string; answer?: string; answer_fa?: string; sort_order?: number; active?: boolean }) =>
    apiRequest(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest(`/faq/${id}`, { method: 'DELETE' }),
};

// Check if API is available
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
