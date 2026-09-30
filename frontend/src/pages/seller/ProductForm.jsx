import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  location: '',
  images: '',
  status: 'active',
};

const ProductForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService
      .getCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    let active = true;
    productService
      .getProductById(id)
      .then((product) => {
        if (!active) return;
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          stockQuantity: product.stock_quantity ?? '',
          categoryId: product.category_id || product.category?.id || '',
          location: product.location || '',
          images: (product.images || []).join(', '),
          status: product.status || 'active',
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load product');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode, id]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildPayload = () => {
    const price = Number(form.price);
    const stockQuantity = form.stockQuantity === '' ? 0 : Number(form.stockQuantity);

    if (!form.name.trim()) {
      throw new Error('Product name is required');
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Enter a valid price');
    }
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
      throw new Error('Stock must be a whole number (0 or more)');
    }

    const payload = {
      name: form.name.trim(),
      price,
      stockQuantity,
      status: form.status || 'active',
      images: form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (form.description.trim()) payload.description = form.description.trim();
    if (form.location.trim()) payload.location = form.location.trim();
    if (form.categoryId) payload.categoryId = form.categoryId;

    return payload;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const payload = buildPayload();
      if (mode === 'edit') {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading product…" />;

  return (
    <div>
      <header className="page__header">
        <h1>{mode === 'edit' ? 'Edit product' : 'Add product'}</h1>
        <p>List traditional goods for the NileLink community.</p>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <label className="field">
          Name *
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label className="field">
          Description
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={onChange}
          />
        </label>
        <div className="filters-row">
          <label className="field">
            Price (KES) *
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
              required
            />
          </label>
          <label className="field">
            Stock *
            <input
              name="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={form.stockQuantity}
              onChange={onChange}
              required
            />
          </label>
        </div>
        <div className="filters-row">
          <label className="field">
            Category
            <select name="categoryId" value={form.categoryId} onChange={onChange}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Status
            <select name="status" value={form.status} onChange={onChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
        <label className="field">
          Location
          <input name="location" value={form.location} onChange={onChange} />
        </label>
        <label className="field">
          Image URL (optional)
          <input
            name="images"
            value={form.images}
            onChange={onChange}
            placeholder="https://example.com/photo.jpg"
          />
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : mode === 'edit' ? 'Update product' : 'Create product'}
          </button>
          <Link className="btn btn--secondary" to="/seller/products">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
