import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  const body = unwrap(data);
  return {
    products: body.products || body.items || (Array.isArray(body) ? body : []),
    pagination: body.pagination || {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 12,
      total: body.total ?? 0,
      pages: body.pages ?? 1,
    },
  };
};

export const getMyProducts = async (params = {}) => {
  const { data } = await api.get('/products/seller/mine', { params });
  const body = unwrap(data);
  return {
    products: body.products || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  const body = unwrap(data);
  return body.product || body;
};

export const getProductReviews = async (id, params = {}) => {
  const { data } = await api.get(`/reviews/product/${id}`, { params });
  const body = unwrap(data);
  return {
    reviews: body.reviews || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const createReview = async (payload) => {
  const { data } = await api.post('/reviews', payload);
  return unwrap(data);
};

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  const body = unwrap(data);
  return body.product || body;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  const body = unwrap(data);
  return body.product || body;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return unwrap(data);
};
