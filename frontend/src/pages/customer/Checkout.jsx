import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import * as orderService from '../../services/orderService';
import * as paymentService from '../../services/paymentService';
import '../../styles/marketplace.css';

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, clear, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    deliveryCity: user?.city || '',
    deliveryCounty: user?.county || '',
    deliveryPhone: user?.phone || '',
    notes: '',
    mpesaPhone: user?.phone || '',
    payNow: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) {
      setError('Your cart is empty');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const result = await orderService.createOrder({
        deliveryAddress: form.deliveryAddress,
        deliveryCity: form.deliveryCity,
        deliveryCounty: form.deliveryCounty,
        deliveryPhone: form.deliveryPhone,
        notes: form.notes,
      });

      const orders = result.orders || (result.order ? [result.order] : []);
      const primary = orders[0];

      if (!primary) {
        throw new Error('Order was not created');
      }

      if (form.payNow && form.mpesaPhone) {
        try {
          for (const ord of orders) {
            await paymentService.initiateMpesa({
              orderId: ord.id,
              phone: form.mpesaPhone,
            });
          }
          setMessage(
            'Order placed. M-Pesa prompt sent — complete payment on your phone (mock mode auto-confirms in development).'
          );
        } catch (payErr) {
          setMessage(
            `Order placed (${primary.order_number || primary.id}). Payment: ${payErr.message}`
          );
        }
      } else {
        setMessage(`Order placed (${primary.order_number || primary.id}).`);
      }

      await clear().catch(() => refreshCart());
      setTimeout(() => navigate(`/orders/${primary.id}`), 1200);
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <main className="page">
        <div className="page__inner">
          <div className="empty-state">
            <h2>Nothing to checkout</h2>
            <p>Add products to your cart first.</p>
            <Link className="btn btn--primary" to="/products" style={{ marginTop: '1rem' }}>
              Browse products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1>Checkout</h1>
          <p>Confirm delivery details and pay with M-Pesa.</p>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {message ? <div className="alert alert--ok">{message}</div> : null}

        <div className="detail-grid">
          <form className="panel" onSubmit={onSubmit}>
            <h2>Delivery</h2>
            <label className="field">
              Address
              <input
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={onChange}
                required
              />
            </label>
            <div className="filters-row">
              <label className="field">
                City
                <input name="deliveryCity" value={form.deliveryCity} onChange={onChange} />
              </label>
              <label className="field">
                County
                <input
                  name="deliveryCounty"
                  value={form.deliveryCounty}
                  onChange={onChange}
                />
              </label>
            </div>
            <label className="field">
              Phone
              <input
                name="deliveryPhone"
                value={form.deliveryPhone}
                onChange={onChange}
                required
              />
            </label>
            <label className="field">
              Notes
              <textarea name="notes" rows={3} value={form.notes} onChange={onChange} />
            </label>

            <h2 style={{ marginTop: '1.25rem' }}>Payment</h2>
            <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="payNow"
                checked={form.payNow}
                onChange={onChange}
              />
              Pay now with M-Pesa
            </label>
            {form.payNow ? (
              <label className="field">
                M-Pesa phone
                <input
                  name="mpesaPhone"
                  value={form.mpesaPhone}
                  onChange={onChange}
                  placeholder="2547XXXXXXXX"
                  required={form.payNow}
                />
              </label>
            ) : null}

            <button className="btn btn--primary" type="submit" disabled={busy}>
              {busy ? 'Placing order…' : `Place order · KES ${Number(total).toLocaleString()}`}
            </button>
          </form>

          <aside className="panel">
            <h2>Summary</h2>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  marginBottom: '0.55rem',
                  fontSize: '0.92rem',
                }}
              >
                <span>
                  {(item.product?.name || 'Item') + ` × ${item.quantity}`}
                </span>
                <strong>KES {Number(item.subtotal || 0).toLocaleString()}</strong>
              </div>
            ))}
            <hr style={{ margin: '0.85rem 0', borderColor: '#e2ebe5' }} />
            <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Total: KES {Number(total).toLocaleString()}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
