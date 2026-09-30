const { supabase } = require('../config/supabase');
const { throwIfError, sanitizeUser, sanitizeUsers } = require('./helpers');

const TABLE = 'users';

const User = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('id, name, email, phone, role, profile_image, address, city, county, account_status, created_at, updated_at')
      .single();

    throwIfError(error, 'Unable to create user');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, name, email, phone, role, profile_image, address, city, county, account_status, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch user');
    return data;
  },

  async findByIdWithPassword(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch user');
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    throwIfError(error, 'Unable to fetch user by email');
    return data;
  },

  async findAll({ role, accountStatus, page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(
        'id, name, email, phone, role, profile_image, address, city, county, account_status, created_at, updated_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (role) query = query.eq('role', role);
    if (accountStatus) query = query.eq('account_status', accountStatus);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list users');

    return {
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async updateById(id, updates) {
    const { password, ...safeUpdates } = updates;

    const payload = { ...safeUpdates };
    if (password) payload.password = password;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('id, name, email, phone, role, profile_image, address, city, county, account_status, created_at, updated_at')
      .single();

    throwIfError(error, 'Unable to update user');
    return data;
  },

  async updateStatus(id, accountStatus) {
    return this.updateById(id, { account_status: accountStatus });
  },

  async countByRole(role) {
    let query = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    if (role) query = query.eq('role', role);

    const { count, error } = await query;
    throwIfError(error, 'Unable to count users');
    return count || 0;
  },

  sanitize: sanitizeUser,
  sanitizeMany: sanitizeUsers,
};

module.exports = User;
