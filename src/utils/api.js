import axios from 'axios';

// LOCAL da: http://localhost:5000/api
// PRODUCTION da: .env.local faylida REACT_APP_API_URL=https://your-backend.railway.app/api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/robomarket-dashboard-2025') && !window.location.pathname.endsWith('/login')) {
        window.location.href = '/robomarket-dashboard-2025/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  update: (id, data) => api.put(`/products/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  update: (id, data) => api.put(`/categories/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const authApi = {
  login: (password) => api.post('/auth/login', { password }),
  me: () => api.get('/auth/me'),
  setup: (password) => api.post('/auth/setup', { password }),
};

export const uploadApi = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/settings/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const reviewsApi = {
  getByProduct: (product_id) => api.get('/reviews', { params: { product_id } }),
  create: (data) => api.post('/reviews', data),
  getAdmin: () => api.get('/reviews/admin'),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const blogApi = {
  getAll: (params) => api.get('/blog', { params }),
  getOne: (id) => api.get(`/blog/${id}`),
  getAdminAll: () => api.get('/blog/admin/all'),
  create: (data) => api.post('/blog', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/blog/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/blog/${id}`),
  uploadFiles: (id, formData) => api.post(`/blog/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeFile: (id, file_url) => api.delete(`/blog/${id}/files`, { data: { file_url } }),
};

export const visitorsApi = {
  track: () => api.post('/visitors/track'),
  getTotal: () => api.get('/visitors/total'),
  getDaily: () => api.get('/visitors/daily'),
};

export const heroCardsApi = {
  get: () => api.get('/settings/hero-cards'),
  update: (cards) => api.put('/settings/hero-cards', cards),
};
