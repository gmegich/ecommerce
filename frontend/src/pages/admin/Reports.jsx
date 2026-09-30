import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Reports = () => {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.getReports().catch(() => null),
      adminService.getPayments().catch(() => ({ payments: [] })),
    ])
      .then(([reports, pay]) => {
        if (!active) return;
        setData(reports);
        setPayments(pay.payments || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load reports');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports…" />;
  if (error) return <div className="alert alert--error">{error}</div>;

  const summary = data?.summary || data?.stats || data || {};

  return (
    <div>
      <header className="page__header">
        <h1>Reports</h1>
        <p>Payments and platform performance snapshots.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">Orders</p>
          <p className="stat-card__value">{summary.orders ?? summary.orderCount ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Paid</p>
          <p className="stat-card__value">{summary.paidOrders ?? summary.paid ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Revenue</p>
          <p className="stat-card__value" style={{ fontSize: '1.2rem' }}>
            KES {Number(summary.revenue ?? summary.totalRevenue ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <h2>Recent payments</h2>
        {payments.length === 0 ? (
          <p style={{ color: '#4d6358' }}>No payment records yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.order_id?.slice?.(0, 8) || p.order_id || '—'}</td>
                  <td>KES {Number(p.amount || 0).toLocaleString()}</td>
                  <td>{p.payment_method}</td>
                  <td>
                    <span className={`badge badge--${p.payment_status}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
