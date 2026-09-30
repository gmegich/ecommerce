const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'messages';

const Message = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select(`
        *,
        sender:sender_id(id, name, profile_image, role),
        receiver:receiver_id(id, name, profile_image, role)
      `)
      .single();

    throwIfError(error, 'Unable to send message');
    return data;
  },

  async findConversation(userA, userB, { page = 1, limit = 50 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        sender:sender_id(id, name, profile_image, role),
        receiver:receiver_id(id, name, profile_image, role)
      `,
        { count: 'exact' }
      )
      .or(
        `and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`
      )
      .order('created_at', { ascending: true })
      .range(from, to);

    throwIfError(error, 'Unable to fetch conversation');

    return {
      messages: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async findInbox(userId, { page = 1, limit = 30 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        sender:sender_id(id, name, profile_image, role),
        receiver:receiver_id(id, name, profile_image, role)
      `,
        { count: 'exact' }
      )
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(from, to);

    throwIfError(error, 'Unable to fetch messages');

    return {
      messages: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async markAsRead(messageId, receiverId) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ read_status: true })
      .eq('id', messageId)
      .eq('receiver_id', receiverId)
      .select('*')
      .single();

    throwIfError(error, 'Unable to mark message as read');
    return data;
  },

  async markConversationAsRead(userId, otherUserId) {
    const { error } = await supabase
      .from(TABLE)
      .update({ read_status: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .eq('read_status', false);

    throwIfError(error, 'Unable to mark conversation as read');
    return true;
  },
};

module.exports = Message;
