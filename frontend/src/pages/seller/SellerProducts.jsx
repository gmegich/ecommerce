import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as sellerService from '../../services/sellerService';
import * as productService from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const res = await sellerService.getProducts();
    setProducts(res.products || []);
  };

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load products');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    setBusyId(id);
    try {
      await productService.deleteProduct(id);
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header
        className="page__header"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
      >
        <div>
          <h1>My products</h1>
          <p>Manage your catalogue listings.</p>
        </div>
        <Link className="btn btn--primary" to="/seller/products/new">
          Add product
        </Link>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <LoadingSpinner label="Loading products…" />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Create your first listing to start selling.</p>
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>KES {Number(p.price || 0).toLocaleString()}</td>
                  <td>{p.stock_quantity}</td>
                  <td>
                    <span className={`badge badge--${p.status}`}>{p.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <Link className="btn btn--ghost-dark btn--sm" to={`/seller/products/${p.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      disabled={busyId === p.id}
                      onClick={() => onDelete(p.id)}
                    >
                      Delete
                    </button>
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

export default SellerProducts;
