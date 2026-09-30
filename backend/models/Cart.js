const { supabase } = require('../config/supabase');
const { throwIfError } = require('./helpers');
const Product = require('./Product');

const CARTS = 'carts';
const ITEMS = 'cart_items';

const ITEM_SELECT = `
  *,
  product:product_id(
    id,
    name,
    price,
    stock_quantity,
    images,
    status,
    seller_id
  )
`;

const recalculateSubtotal = (price, quantity) =>
  Number((Number(price) * Number(quantity)).toFixed(2));

const Cart = {
  async getOrCreateByUserId(userId) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from(CARTS)
      .insert([{ user_id: userId }])
      .select('*')
      .single();

    throwIfError(error, 'Unable to create cart');
    return { ...data, items: [] };
  },

  async findByUserId(userId) {
    const { data: cart, error } = await supabase
      .from(CARTS)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch cart');
    if (!cart) return null;

    const { data: items, error: itemsError } = await supabase
      .from(ITEMS)
      .select(ITEM_SELECT)
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: true });

    throwIfError(itemsError, 'Unable to fetch cart items');

    const list = items || [];
    const total = list.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

    return {
      ...cart,
      items: list,
      total: Number(total.toFixed(2)),
      itemCount: list.reduce((sum, item) => sum + item.quantity, 0),
    };
  },

  async addItem(userId, { productId, quantity = 1 }) {
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      const { AppError } = require('../middleware/errorMiddleware');
      throw new AppError('Product is not available', 400);
    }

    if (product.stock_quantity < quantity) {
      const { AppError } = require('../middleware/errorMiddleware');
      throw new AppError('Insufficient stock for this product', 400);
    }

    const cart = await this.getOrCreateByUserId(userId);

    const { data: existing, error: existingError } = await supabase
      .from(ITEMS)
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .maybeSingle();

    throwIfError(existingError, 'Unable to check cart item');

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (product.stock_quantity < nextQty) {
        const { AppError } = require('../middleware/errorMiddleware');
        throw new AppError('Insufficient stock for this product', 400);
      }

      return this.updateItem(userId, existing.id, nextQty);
    }

    const price = Number(product.price);
    const { error } = await supabase.from(ITEMS).insert([
      {
        cart_id: cart.id,
        product_id: productId,
        quantity,
        price,
        subtotal: recalculateSubtotal(price, quantity),
      },
    ]);

    throwIfError(error, 'Unable to add item to cart');
    return this.findByUserId(userId);
  },

  async updateItem(userId, itemId, quantity) {
    const { AppError } = require('../middleware/errorMiddleware');

    if (quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    const cart = await this.getOrCreateByUserId(userId);

    const { data: item, error } = await supabase
      .from(ITEMS)
      .select('*, product:product_id(id, stock_quantity, price, status)')
      .eq('id', itemId)
      .eq('cart_id', cart.id)
      .maybeSingle();

    throwIfError(error, 'Unable to fetch cart item');
    if (!item) throw new AppError('Cart item not found', 404);

    if (!item.product || item.product.status !== 'active') {
      throw new AppError('Product is not available', 400);
    }

    if (item.product.stock_quantity < quantity) {
      throw new AppError('Insufficient stock for this product', 400);
    }

    const price = Number(item.price);
    const { error: updateError } = await supabase
      .from(ITEMS)
      .update({
        quantity,
        subtotal: recalculateSubtotal(price, quantity),
      })
      .eq('id', itemId);

    throwIfError(updateError, 'Unable to update cart item');
    return this.findByUserId(userId);
  },

  async removeItem(userId, itemId) {
    const cart = await this.getOrCreateByUserId(userId);

    const { error } = await supabase
      .from(ITEMS)
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    throwIfError(error, 'Unable to remove cart item');
    return this.findByUserId(userId);
  },

  async clear(userId) {
    const cart = await this.findByUserId(userId);
    if (!cart) return null;

    const { error } = await supabase.from(ITEMS).delete().eq('cart_id', cart.id);
    throwIfError(error, 'Unable to clear cart');
    return this.findByUserId(userId);
  },
};

module.exports = Cart;
