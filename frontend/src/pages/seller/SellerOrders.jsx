import { useEffect, useState } from 'react';
import * as sellerService from '../../services/sellerService';
import * as orderService from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const res = await sellerService.getOrders();
    setOrders(res.orders || []);
  };

  useEffect(() => {
    let active = true;
    load()
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

  const onStatus = async (id, orderStatus) => {
    setBusyId(id);
    setError('');
    try {
      await orderService.updateOrderStatus(id, { orderStatus });
      await load();
    } catch (err) {
      setError(err.message || 'Status update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="page__header">
        <h1>Seller orders</h1>
        <p>Fulfill and update delivery status for your buyers.</p>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <LoadingSpinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Orders for your products will show up here.</p>
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number || order.id.slice(0, 8)}</td>
                  <td>{order.buyer?.name || 'Buyer'}</td>
                  <td>KES {Number(order.total_amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${order.payment_status}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.order_status}
                      disabled={busyId === order.id}
                      onChange={(e) => onStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
