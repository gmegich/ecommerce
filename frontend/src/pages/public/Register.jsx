import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const initial = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer',
  city: '',
  county: '',
  address: '',
  businessName: '',
  businessDescription: '',
  businessLocation: '',
};

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
        city: form.city || undefined,
        county: form.county || undefined,
        address: form.address || undefined,
      };

      if (form.role === 'seller') {
        payload.businessName = form.businessName;
        payload.businessDescription = form.businessDescription || undefined;
        payload.businessLocation = form.businessLocation || form.city || undefined;
      }

      await register(payload);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card auth-card--wide" onSubmit={onSubmit} noValidate>
        <h1>Create account</h1>
        <p className="auth-card__lead">
          Join as a customer in Kenya or a South Sudanese supplier.
        </p>

        {error ? <div className="auth-alert">{error}</div> : null}

        <div className="auth-role">
          <label className={form.role === 'customer' ? 'is-active' : ''}>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={form.role === 'customer'}
              onChange={onChange}
            />
            Customer
          </label>
          <label className={form.role === 'seller' ? 'is-active' : ''}>
            <input
              type="radio"
              name="role"
              value="seller"
              checked={form.role === 'seller'}
              onChange={onChange}
            />
            Seller / Supplier
          </label>
        </div>

        <div className="auth-grid">
          <label>
            Full name
            <input name="name" value={form.name} onChange={onChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={onChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={onChange} placeholder="07XXXXXXXX" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              minLength={6}
              required
            />
          </label>
          <label>
            City
            <input name="city" value={form.city} onChange={onChange} placeholder="Nairobi" />
          </label>
          <label>
            County
            <input name="county" value={form.county} onChange={onChange} />
          </label>
        </div>

        <label>
          Address
          <input name="address" value={form.address} onChange={onChange} />
        </label>

        {form.role === 'seller' ? (
          <div className="auth-seller">
            <h2>Business details</h2>
            <label>
              Business name
              <input
                name="businessName"
                value={form.businessName}
                onChange={onChange}
                required={form.role === 'seller'}
              />
            </label>
            <label>
              Business location
              <input
                name="businessLocation"
                value={form.businessLocation}
                onChange={onChange}
              />
            </label>
            <label>
              Business description
              <textarea
                name="businessDescription"
                value={form.businessDescription}
                onChange={onChange}
                rows={3}
              />
            </label>
          </div>
        ) : null}

        <button className="btn btn--primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-card__footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
