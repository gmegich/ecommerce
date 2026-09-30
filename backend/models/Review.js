const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'reviews';

const Review = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*, buyer:buyer_id(id, name, profile_image)')
      .single();

    throwIfError(error, 'Unable to create review');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, buyer:buyer_id(id, name, profile_image)')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch review');
    return data;
  },

  async findByProduct(productId, { page = 1, limit = 10 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*, buyer:buyer_id(id, name, profile_image)', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, to);

    throwIfError(error, 'Unable to list reviews');

    return {
      reviews: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async findByBuyerAndProduct(buyerId, productId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('buyer_id', buyerId)
      .eq('product_id', productId)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch review');
    return data;
  },

  async updateById(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select('*, buyer:buyer_id(id, name, profile_image)')
      .single();

    throwIfError(error, 'Unable to update review');
    return data;
  },

  async deleteById(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    throwIfError(error, 'Unable to delete review');
    return true;
  },
};

module.exports = Review;
