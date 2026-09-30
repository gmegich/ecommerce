import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    adminService
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load admin dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading admin dashboard…" />;
  if (error) return <div className="alert alert--error">{error}</div>;

  const users = data?.users || {};
  const products = data?.products || {};
  const orders = data?.orders || {};
  const revenue = data?.revenue || {};

  return (
    <div>
      <header className="page__header">
        <h1>Admin dashboard</h1>
        <p>Platform-wide overview for NileLink Market.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">Customers</p>
          <p className="stat-card__value">{users.customers ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Sellers</p>
          <p className="stat-card__value">{users.sellers ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Products</p>
          <p className="stat-card__value">{products.active ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Orders</p>
          <p className="stat-card__value">{orders.total ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Revenue</p>
          <p className="stat-card__value" style={{ fontSize: '1.2rem' }}>
            KES {Number(revenue.total ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Pending sellers</p>
          <p className="stat-card__value">{users.pendingSellers ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
