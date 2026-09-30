const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'notifications';

const Notification = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create notification');
    return data;
  },

  async createMany(payloads) {
    if (!payloads?.length) return [];

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payloads)
      .select('*');

    throwIfError(error, 'Unable to create notifications');
    return data || [];
  },

  async findByUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (unreadOnly) query = query.eq('read_status', false);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list notifications');

    return {
      notifications: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async markAsRead(id, userId) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ read_status: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    throwIfError(error, 'Unable to mark notification as read');
    return data;
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from(TABLE)
      .update({ read_status: true })
      .eq('user_id', userId)
      .eq('read_status', false);

    throwIfError(error, 'Unable to mark notifications as read');
    return true;
  },

  async countUnread(userId) {
    const { count, error } = await supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read_status', false);

    throwIfError(error, 'Unable to count unread notifications');
    return count || 0;
  },
};

module.exports = Notification;
