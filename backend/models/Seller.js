const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'seller_profiles';

const Seller = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create seller profile');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, users:user_id(id, name, email, phone, profile_image, account_status)')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch seller profile');
    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, users:user_id(id, name, email, phone, profile_image, account_status)')
      .eq('user_id', userId)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch seller profile');
    return data;
  },

  async findAll({ verificationStatus, page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select('*, users:user_id(id, name, email, phone, profile_image, account_status)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus);
    }

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list sellers');

    return {
      sellers: data || [],
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

    throwIfError(error, 'Unable to update seller profile');
    return data;
  },

  async updateVerificationStatus(id, verificationStatus) {
    return this.updateById(id, { verification_status: verificationStatus });
  },

  async countByStatus(verificationStatus) {
    let query = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus);
    }

    const { count, error } = await query;
    throwIfError(error, 'Unable to count sellers');
    return count || 0;
  },
};

module.exports = Seller;
