import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Cart = () => {
  const { items, total, itemCount, loading, updateItem, removeItem, error } = useCart();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleUpdate = async (itemId, quantity) => {
    setBusy(true);
    setLocalError('');
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      setLocalError(err.message || 'Could not update item');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (itemId) => {
    setBusy(true);
    setLocalError('');
    try {
      await removeItem(itemId);
    } catch (err) {
      setLocalError(err.message || 'Could not remove item');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1>Your cart</h1>
          <p>
            {itemCount} item{itemCount === 1 ? '' : 's'} · KES{' '}
            {Number(total || 0).toLocaleString()}
          </p>
        </header>

        {(error || localError) && (
          <div className="alert alert--error">{localError || error}</div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading cart…" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h2>Cart is empty</h2>
            <p>Browse products and add items to continue.</p>
            <Link className="btn btn--primary" to="/products" style={{ marginTop: '1rem' }}>
              Browse products
            </Link>
          </div>
        ) : (
          <div className="detail-grid">
            <div>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  busy={busy}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <aside className="panel">
              <h2>Order summary</h2>
              <p style={{ marginBottom: '0.5rem' }}>Items: {itemCount}</p>
              <p style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>
                Total: KES {Number(total || 0).toLocaleString()}
              </p>
              <Link className="btn btn--primary" to="/checkout" style={{ width: '100%' }}>
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
