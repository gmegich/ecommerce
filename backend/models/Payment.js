const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'payments';

const Payment = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create payment');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*, order:order_id(id, order_number, total_amount, payment_status)')
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch payment');
    return data;
  },

  async findByOrderId(orderId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    throwIfError(error, 'Unable to fetch payments for order');
    return data || [];
  },

  async findByTransactionId(transactionId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch payment by transaction id');
    return data;
  },

  async updateById(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(error, 'Unable to update payment');
    return data;
  },

  async findAll({ page = 1, limit = 20, paymentStatus } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select('*, order:order_id(id, order_number, total_amount)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (paymentStatus) query = query.eq('payment_status', paymentStatus);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list payments');

    return {
      payments: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },
};

module.exports = Payment;
