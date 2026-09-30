import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import * as paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const STEPS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState('');

  const load = async () => {
    const data = await orderService.getOrderById(id);
    setOrder(data);
    setPhone(data.delivery_phone || '');
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Order not found');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentIndex = useMemo(() => {
    if (!order) return 0;
    if (order.order_status === 'cancelled') return -1;
    return STEPS.indexOf(order.order_status || 'pending');
  }, [order]);

  const onCancel = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await orderService.cancelOrder(id);
      setOrder(updated);
      setMessage('Order cancelled');
    } catch (err) {
      setError(err.message || 'Could not cancel order');
    } finally {
      setBusy(false);
    }
  };

  const onPay = async () => {
    setBusy(true);
    setError('');
    try {
      await paymentService.initiateMpesa({ orderId: id, phone });
      setMessage('M-Pesa prompt sent. Complete payment on your phone.');
      await load();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="page__inner">
          <LoadingSpinner label="Loading order…" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="page">
        <div className="page__inner">
          <div className="empty-state">
            <h2>Order not found</h2>
            <p>{error}</p>
            <Link to="/orders" className="btn btn--primary">
              Back to orders
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
          <h1>Order {order.order_number || order.id.slice(0, 8)}</h1>
          <p>
            Placed{' '}
            {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
          </p>
        </header>

        {message ? <div className="alert alert--ok">{message}</div> : null}
        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="detail-grid">
          <section className="panel">
            <h2>Tracking</h2>
            {order.order_status === 'cancelled' ? (
              <p className="badge badge--cancelled">Cancelled</p>
            ) : (
              <ul className="timeline">
                {STEPS.map((step, index) => {
                  const done = index < currentIndex;
                  const current = index === currentIndex;
                  return (
                    <li
                      key={step}
                      className={`timeline__step ${done ? 'is-done' : ''} ${
                        current ? 'is-current' : ''
                      }`}
                    >
                      <span className="timeline__dot" />
                      <div>
                        <p className="timeline__label">{step.replaceAll('_', ' ')}</p>
                        <p className="timeline__meta">
                          {done ? 'Completed' : current ? 'Current' : 'Upcoming'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <h2 style={{ marginTop: '1.25rem' }}>Items</h2>
            {(order.items || order.order_items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <strong>KES {Number(item.subtotal || 0).toLocaleString()}</strong>
              </div>
            ))}
          </section>

          <aside className="panel">
            <h2>Details</h2>
            <p>
              <strong>Total:</strong> KES {Number(order.total_amount || 0).toLocaleString()}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Payment:</strong>{' '}
              <span className={`badge badge--${order.payment_status}`}>
                {order.payment_status}
              </span>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Delivery:</strong> {order.delivery_address}
              {order.delivery_city ? `, ${order.delivery_city}` : ''}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Phone:</strong> {order.delivery_phone || '—'}
            </p>

            {order.payment_status !== 'paid' && order.order_status !== 'cancelled' ? (
              <div style={{ marginTop: '1rem' }}>
                <label className="field">
                  M-Pesa phone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy}
                  onClick={onPay}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Pay with M-Pesa
                </button>
              </div>
            ) : null}

            {['pending', 'confirmed'].includes(order.order_status) ? (
              <button
                type="button"
                className="btn btn--danger"
                disabled={busy}
                onClick={onCancel}
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                Cancel order
              </button>
            ) : null}

            <Link
              to="/orders"
              className="btn btn--ghost-dark"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              Back to orders
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default OrderDetails;
