const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'categories';

const Category = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create category');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch category');
    return data;
  },

  async findByName(name) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('name', name)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch category');
    return data;
  },

  async findAll({ status = 'active', page = 1, limit = 50 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list categories');

    return {
      categories: data || [],
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

    throwIfError(error, 'Unable to update category');
    return data;
  },

  async deleteById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: 'inactive' })
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(error, 'Unable to delete category');
    return data;
  },
};

module.exports = Category;
