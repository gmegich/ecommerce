import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';

const CartContext = createContext(null);

const emptyCart = {
  items: [],
  total: 0,
  itemCount: 0,
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyCart = useCallback((next) => {
    if (!next) {
      setCart(emptyCart);
      return;
    }
    setCart({
      ...next,
      items: next.items || [],
      total: Number(next.total ?? 0),
      itemCount:
        Number(
          next.itemCount ??
            next.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ??
            0
        ),
    });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      applyCart(emptyCart);
      return emptyCart;
    }

    setLoading(true);
    setError('');
    try {
      const next = await cartService.getCart();
      applyCart(next);
      return next;
    } catch (err) {
      setError(err.message || 'Unable to load cart');
      applyCart(emptyCart);
      return emptyCart;
    } finally {
      setLoading(false);
    }
  }, [applyCart, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshCart();
    } else {
      applyCart(emptyCart);
    }
  }, [isAuthenticated, token, refreshCart, applyCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      const next = await cartService.addToCart({ productId, quantity });
      applyCart(next);
      return next;
    },
    [applyCart]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      const next = await cartService.updateCartItem(itemId, quantity);
      applyCart(next);
      return next;
    },
    [applyCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      const next = await cartService.removeCartItem(itemId);
      applyCart(next);
      return next;
    },
    [applyCart]
  );

  const clear = useCallback(async () => {
    try {
      const next = await cartService.clearCart();
      applyCart(next || emptyCart);
      return next;
    } catch {
      applyCart(emptyCart);
      return emptyCart;
    }
  }, [applyCart]);

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
      loading,
      error,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, error, refreshCart, addItem, updateItem, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
