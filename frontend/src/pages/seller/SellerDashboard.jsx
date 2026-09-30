import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as sellerService from '../../services/sellerService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    sellerService
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setData(res);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) return <div className="alert alert--error">{error}</div>;

  const stats = data?.stats || data || {};

  return (
    <div>
      <header className="page__header">
        <h1>Seller dashboard</h1>
        <p>Overview of your catalogue and orders.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">Products</p>
          <p className="stat-card__value">{stats.products ?? stats.productCount ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Orders</p>
          <p className="stat-card__value">{stats.orders ?? stats.orderCount ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Pending</p>
          <p className="stat-card__value">{stats.pendingOrders ?? stats.pending ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">Revenue</p>
          <p className="stat-card__value" style={{ fontSize: '1.25rem' }}>
            KES {Number(stats.revenue ?? stats.totalRevenue ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link className="btn btn--primary" to="/seller/products/new">
          Add product
        </Link>
        <Link className="btn btn--secondary" to="/seller/orders">
          View orders
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
