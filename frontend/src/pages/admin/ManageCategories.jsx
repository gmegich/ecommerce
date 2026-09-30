import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await adminService.getCategories();
    setCategories(list || []);
  };

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load categories');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminService.createCategory(form);
      setForm({ name: '', description: '' });
      setMessage('Category created');
      await load();
    } catch (err) {
      setError(err.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminService.deleteCategory(id);
      await load();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <header className="page__header">
        <h1>Manage categories</h1>
        <p>Organize the product catalogue.</p>
      </header>

      {message ? <div className="alert alert--ok">{message}</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}

      <form className="panel" onSubmit={onCreate} style={{ marginBottom: '1.25rem', maxWidth: 640 }}>
        <h2>Add category</h2>
        <label className="field">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </label>
        <label className="field">
          Description
          <input
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Create category'}
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Loading categories…" />
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.description || '—'}</td>
                  <td>
                    <span className={`badge badge--${c.status || 'active'}`}>
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => onDelete(c.id)}
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

export default ManageCategories;
