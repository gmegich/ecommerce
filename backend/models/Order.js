const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const ORDERS = 'orders';
const ITEMS = 'order_items';

const ORDER_SELECT = `
  *,
  buyer:buyer_id(id, name, email, phone),
  seller:seller_id(id, business_name, verification_status),
  items:order_items(*)
`;

const Order = {
  async create({ order, items }) {
    const { data: createdOrder, error } = await supabase
      .from(ORDERS)
      .insert([order])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create order');

    const rows = items.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { error: itemsError } = await supabase.from(ITEMS).insert(rows);
    throwIfError(itemsError, 'Unable to create order items');

    return this.findById(createdOrder.id);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(ORDERS)
      .select(ORDER_SELECT)
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch order');
    return data;
  },

  async findByOrderNumber(orderNumber) {
    const { data, error } = await supabase
      .from(ORDERS)
      .select(ORDER_SELECT)
      .eq('order_number', orderNumber)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch order');
    return data;
  },

  async findByBuyer(buyerId, { page = 1, limit = 10 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(ORDERS)
      .select(ORDER_SELECT, { count: 'exact' })
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
      .range(from, to);

    throwIfError(error, 'Unable to list buyer orders');

    return {
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async findBySeller(sellerId, { page = 1, limit = 10, orderStatus } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(ORDERS)
      .select(ORDER_SELECT, { count: 'exact' })
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (orderStatus) query = query.eq('order_status', orderStatus);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list seller orders');

    return {
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async findAll({ page = 1, limit = 20, orderStatus, paymentStatus } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(ORDERS)
      .select(ORDER_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (orderStatus) query = query.eq('order_status', orderStatus);
    if (paymentStatus) query = query.eq('payment_status', paymentStatus);

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list orders');

    return {
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    };
  },

  async updateStatus(id, { orderStatus, deliveryStatus, paymentStatus }) {
    const updates = {};
    if (orderStatus) updates.order_status = orderStatus;
    if (deliveryStatus) updates.delivery_status = deliveryStatus;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from(ORDERS)
      .update(updates)
      .eq('id', id)
      .select(ORDER_SELECT)
      .single();

    throwIfError(error, 'Unable to update order status');
    return data;
  },

  async count({ orderStatus, buyerId, sellerId } = {}) {
    let query = supabase.from(ORDERS).select('id', { count: 'exact', head: true });
    if (orderStatus) query = query.eq('order_status', orderStatus);
    if (buyerId) query = query.eq('buyer_id', buyerId);
    if (sellerId) query = query.eq('seller_id', sellerId);

    const { count, error } = await query;
    throwIfError(error, 'Unable to count orders');
    return count || 0;
  },
};

module.exports = Order;
