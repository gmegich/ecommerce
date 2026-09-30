import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const links = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/sellers', label: 'Sellers' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/reports', label: 'Reports' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="dash">
      {open ? (
        <button
          type="button"
          className="dash__backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside className={`dash__sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/" className="dash__brand">
          NileLink Admin
        </Link>
        <nav className="dash__nav" onClick={() => setOpen(false)}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/">Storefront</NavLink>
        </nav>
      </aside>
      <div className="dash__main">
        <header className="dash__top">
          <button type="button" className="dash__menu-btn" onClick={() => setOpen(true)}>
            Menu
          </button>
          <h1>Admin console</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#4d6358', fontSize: '0.9rem' }}>{user?.name}</span>
            <button type="button" className="btn btn--ghost-dark btn--sm" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <div className="dash__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
