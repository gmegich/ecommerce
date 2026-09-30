import api from './api';

export const checkApiHealth = async () => {
  const { data } = await api.get('/');
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Token may already be invalid; still clear local session.
  }
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/users/profile', payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put('/users/password', payload);
  return data;
};
