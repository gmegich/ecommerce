import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
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

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const res = await adminService.getOrders();
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

  const onStatus = async (id, order_status) => {
    setBusyId(id);
    try {
      await adminService.updateOrder(id, { orderStatus: order_status });
      await load();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="page__header">
        <h1>Manage orders</h1>
        <p>Monitor and adjust order statuses across the platform.</p>
      </header>
      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <LoadingSpinner label="Loading orders…" />
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
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number || o.id.slice(0, 8)}</td>
                  <td>{o.buyer?.name || '—'}</td>
                  <td>KES {Number(o.total_amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${o.payment_status}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.order_status}
                      disabled={busyId === o.id}
                      onChange={(e) => onStatus(o.id, e.target.value)}
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

export default ManageOrders;
