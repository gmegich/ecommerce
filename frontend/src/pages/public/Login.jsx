import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const Login = () => {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resolveDest = (role) => {
    const from = location.state?.from;
    const fromPath = typeof from === 'string' ? from : from?.pathname;
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/seller';
    return fromPath || '/profile';
  };

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    navigate(resolveDest(user?.role), { replace: true });
  }, [loading, isAuthenticated, user, location.state, navigate]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(form);
      navigate(resolveDest(res.data.user.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="auth-card__lead">Sign in to NileLink Market</p>

        {error ? <div className="auth-alert">{error}</div> : null}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="btn btn--primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-card__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
