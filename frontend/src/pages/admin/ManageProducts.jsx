import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  sellerId: '',
  location: '',
  imageUrl: '',
  status: 'active',
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [priceEdits, setPriceEdits] = useState({});

  const load = async () => {
    const [productRes, sellerRes, categoryList] = await Promise.all([
      adminService.getProducts({ limit: 100 }),
      adminService.getSellers({ limit: 100 }),
      categoryService.getCategories(),
    ]);
    const list = (productRes.products || []).filter((p) => p.status !== 'deleted');
    setProducts(list);
    setSellers(sellerRes.sellers || []);
    setCategories(categoryList || []);
    const edits = {};
    list.forEach((p) => {
      edits[p.id] = String(p.price ?? '');
    });
    setPriceEdits(edits);
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

  const onFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    try {
      await productService.createProduct({
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity || 0),
        categoryId: form.categoryId || undefined,
        sellerId: form.sellerId,
        location: form.location || undefined,
        status: form.status,
        images: form.imageUrl ? [form.imageUrl.trim()] : [],
      });
      setForm(emptyForm);
      setShowForm(false);
      setMessage('Product added successfully');
      await load();
    } catch (err) {
      setError(err.message || 'Could not create product');
    } finally {
      setCreating(false);
    }
  };

  const onSavePrice = async (id) => {
    const price = Number(priceEdits[id]);
    if (Number.isNaN(price) || price < 0) {
      setError('Enter a valid price');
      return;
    }

    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await productService.updateProduct(id, { price });
      setMessage('Price updated');
      await load();
    } catch (err) {
      setError(err.message || 'Price update failed');
    } finally {
      setBusyId(null);
    }
  };

  const onRemove = async (id, name) => {
    if (!window.confirm(`Remove product "${name}"? This hides it from the store.`)) {
      return;
    }

    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await productService.deleteProduct(id);
      setMessage('Product removed');
      await load();
    } catch (err) {
      setError(err.message || 'Remove failed');
    } finally {
      setBusyId(null);
    }
  };

  const onStatus = async (id, status) => {
    setBusyId(id);
    try {
      await adminService.updateProduct(id, { status });
      await load();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading products…" />;

  return (
    <div>
      <header
        className="page__header"
        style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h1>Manage products</h1>
          <p>Add products, change prices, or remove listings — no coding needed.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setShowForm((v) => !v);
            setError('');
            setMessage('');
          }}
        >
          {showForm ? 'Close form' : 'Add product'}
        </button>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {message ? <div className="alert alert--ok">{message}</div> : null}

      {showForm ? (
        <form className="panel" onSubmit={onCreate} style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ marginBottom: '0.85rem', fontFamily: 'var(--font-display)', color: 'var(--color-forest)' }}>
            New product
          </h2>
          <div className="profile-grid">
            <label className="field">
              Product name *
              <input name="name" value={form.name} onChange={onFormChange} required />
            </label>
            <label className="field">
              Price (KES) *
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={onFormChange}
                required
              />
            </label>
            <label className="field">
              Stock quantity
              <input
                type="number"
                min="0"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={onFormChange}
              />
            </label>
            <label className="field">
              Seller / supplier *
              <select name="sellerId" value={form.sellerId} onChange={onFormChange} required>
                <option value="">Select seller</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.business_name}
                    {s.verification_status === 'approved' ? '' : ` (${s.verification_status})`}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Category
              <select name="categoryId" value={form.categoryId} onChange={onFormChange}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Status
              <select name="status" value={form.status} onChange={onFormChange}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="draft">draft</option>
              </select>
            </label>
          </div>
          <label className="field">
            Location
            <input name="location" value={form.location} onChange={onFormChange} />
          </label>
          <label className="field">
            Image URL
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onFormChange}
              placeholder="https://..."
            />
          </label>
          <label className="field">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={onFormChange}
              rows={3}
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={creating}>
            {creating ? 'Saving…' : 'Save product'}
          </button>
        </form>
      ) : null}

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Use “Add product” to create the first listing.</p>
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Seller</th>
                <th>Price (KES)</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.seller?.business_name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceEdits[p.id] ?? ''}
                        disabled={busyId === p.id}
                        onChange={(e) =>
                          setPriceEdits((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        style={{ width: '7rem' }}
                      />
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={
                          busyId === p.id ||
                          Number(priceEdits[p.id]) === Number(p.price)
                        }
                        onClick={() => onSavePrice(p.id)}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                  <td>{p.stock_quantity}</td>
                  <td>
                    <select
                      value={p.status || 'active'}
                      disabled={busyId === p.id}
                      onChange={(e) => onStatus(p.id, e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="draft">draft</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      disabled={busyId === p.id}
                      onClick={() => onRemove(p.id, p.name)}
                    >
                      Remove
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

export default ManageProducts;
