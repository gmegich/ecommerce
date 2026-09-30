import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  const body = unwrap(data);
  return {
    notifications: body.notifications || (Array.isArray(body) ? body : []),
    unreadCount: body.unreadCount ?? body.unread ?? 0,
  };
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return unwrap(data);
};

export const markAllAsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return unwrap(data);
};
