const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'complaints';

const Complaint = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create complaint');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        reporter:reporter_id(id, name, email),
        reported_user:reported_user_id(id, name, email),
        product:product_id(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch complaint');
    return data;
  },

  async findAll({ page = 1, limit = 20, status } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        reporter:reporter_id(id, name, email),
        reported_user:reported_user_id(id, name, email),
        product:product_id(id, name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list complaints');

    return {
      complaints: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async updateById(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(error, 'Unable to update complaint');
    return data;
  },
};

module.exports = Complaint;
