import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getCart = async () => {
  const { data } = await api.get('/cart');
  const body = unwrap(data);
  const cart = body.cart || body;
  return {
    ...cart,
    items: cart.items || [],
    total: Number(cart.total ?? 0),
    itemCount: Number(
      cart.itemCount ?? cart.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
    ),
  };
};

export const addToCart = async ({ productId, quantity = 1 }) => {
  const { data } = await api.post('/cart/items', { productId, quantity });
  const body = unwrap(data);
  return body.cart || body;
};

export const updateCartItem = async (itemId, quantity) => {
  const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
  const body = unwrap(data);
  return body.cart || body;
};

export const removeCartItem = async (itemId) => {
  const { data } = await api.delete(`/cart/items/${itemId}`);
  const body = unwrap(data);
  return body.cart || body;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  const body = unwrap(data);
  return body.cart || body;
};
