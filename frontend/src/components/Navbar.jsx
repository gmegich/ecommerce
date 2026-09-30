import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import * as notificationService from '../services/notificationService';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return undefined;
    }

    let active = true;
    notificationService
      .getNotifications()
      .then((res) => {
        if (!active) return;
        const list = res.notifications || [];
        const count =
          res.unreadCount ??
          list.filter((n) => !n.read_status).length;
        setUnread(count);
      })
      .catch(() => {
        if (active) setUnread(0);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const dashboardLink =
    user?.role === 'admin'
      ? { to: '/admin', label: 'Admin' }
      : user?.role === 'seller'
        ? { to: '/seller', label: 'Seller' }
        : null;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          NileLink Market
        </Link>
        <nav className="navbar__links" aria-label="Main">
          <Link to="/products">Products</Link>
          {!loading && isAuthenticated ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart
                {itemCount > 0 ? (
                  <span className="cart-link__count">{itemCount}</span>
                ) : null}
              </Link>
              <Link to="/orders">Orders</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/notifications" className="notif-bell">
                Alerts
                {unread > 0 ? (
                  <span className="notif-bell__count">{unread}</span>
                ) : null}
              </Link>
              {dashboardLink ? (
                <Link to={dashboardLink.to}>{dashboardLink.label}</Link>
              ) : null}
              <Link to="/profile">Profile</Link>
              <span className="navbar__user">{user?.name?.split(' ')[0]}</span>
              <button type="button" className="navbar__logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
