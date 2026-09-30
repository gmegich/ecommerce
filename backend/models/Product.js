const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');

const TABLE = 'products';

const PRODUCT_SELECT = `
  *,
  category:category_id(id, name, status),
  seller:seller_id(
    id,
    business_name,
    business_location,
    verification_status,
    users:user_id(id, name, email, phone, profile_image)
  )
`;

const Product = {
  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select(PRODUCT_SELECT)
      .single();

    throwIfError(error, 'Unable to create product');
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch product');
    return data;
  },

  async findAll({
    search,
    categoryId,
    sellerId,
    minPrice,
    maxPrice,
    status = 'active',
    availability,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE)
      .select(PRODUCT_SELECT, { count: 'exact' })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (sellerId) query = query.eq('seller_id', sellerId);
    if (minPrice !== undefined) query = query.gte('price', minPrice);
    if (maxPrice !== undefined) query = query.lte('price', maxPrice);
    if (availability === 'in_stock') query = query.gt('stock_quantity', 0);
    if (availability === 'out_of_stock') query = query.eq('stock_quantity', 0);
    if (search) query = query.ilike('name', `%${search}%`);

    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error, count } = await query;
    throwIfError(error, 'Unable to list products');

    return {
      products: data || [],
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
      .select(PRODUCT_SELECT)
      .single();

    throwIfError(error, 'Unable to update product');
    return data;
  },

  async updateStock(id, stockQuantity) {
    return this.updateById(id, { stock_quantity: stockQuantity });
  },

  async softDelete(id) {
    return this.updateById(id, { status: 'deleted' });
  },

  async count({ status = 'active', sellerId } = {}) {
    let query = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    if (status) query = query.eq('status', status);
    if (sellerId) query = query.eq('seller_id', sellerId);

    const { count, error } = await query;
    throwIfError(error, 'Unable to count products');
    return count || 0;
  },
};

module.exports = Product;
