import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getCategories = async (params = {}) => {
  const { data } = await api.get('/categories', { params });
  const body = unwrap(data);
  return body.categories || (Array.isArray(body) ? body : []);
};

export const getCategoryById = async (id) => {
  const { data } = await api.get(`/categories/${id}`);
  const body = unwrap(data);
  return body.category || body;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  const body = unwrap(data);
  return body.category || body;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  const body = unwrap(data);
  return body.category || body;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return unwrap(data);
};
