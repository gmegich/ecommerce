import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    orderService
      .getOrders()
      .then((res) => {
        if (!active) return;
        setOrders(res.orders || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load orders');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1>My orders</h1>
          <p>Track purchases and delivery status.</p>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {loading ? (
          <LoadingSpinner label="Loading orders…" />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>When you checkout, your orders will appear here.</p>
            <Link className="btn btn--primary" to="/products" style={{ marginTop: '1rem' }}>
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number || order.id.slice(0, 8)}</td>
                    <td>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>KES {Number(order.total_amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge--${order.payment_status || 'pending'}`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${order.order_status || 'pending'}`}>
                        {(order.order_status || 'pending').replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link className="btn btn--ghost-dark btn--sm" to={`/orders/${order.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
