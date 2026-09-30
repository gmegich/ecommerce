import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getInbox = async (params = {}) => {
  const { data } = await api.get('/messages/inbox', { params });
  const body = unwrap(data);
  return {
    messages: body.messages || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

/** Build a unique partner list from inbox messages */
export const getConversations = async () => {
  const result = await getInbox({ limit: 100 });
  const messages = result.messages || [];
  const byPartner = new Map();

  for (const msg of messages) {
    const sender = msg.sender || { id: msg.sender_id };
    const receiver = msg.receiver || { id: msg.receiver_id };
    // We don't know current user here; store both sides and let UI pick.
    // Prefer storing a "other" guess using nested profiles.
    const keyParts = [msg.sender_id, msg.receiver_id].sort();
    const key = keyParts.join(':');
    if (!byPartner.has(key)) {
      byPartner.set(key, {
        id: key,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender,
        receiver,
        partner: receiver,
        lastMessage: msg.message,
        created_at: msg.created_at,
      });
    }
  }

  return Array.from(byPartner.values());
};

export const getThread = async (userId, params = {}) => {
  const { data } = await api.get(`/messages/conversation/${userId}`, { params });
  const body = unwrap(data);
  return {
    messages: body.messages || (Array.isArray(body) ? body : []),
    partner: body.partner || body.user || null,
  };
};

export const sendMessage = async ({ receiverId, message }) => {
  const { data } = await api.post('/messages', { receiverId, message });
  const body = unwrap(data);
  return body.message || body;
};

export const markAsRead = async (id) => {
  const { data } = await api.put(`/messages/${id}/read`);
  return unwrap(data);
};
