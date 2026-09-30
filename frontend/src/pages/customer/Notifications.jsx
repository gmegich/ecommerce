import { useEffect, useState } from 'react';
import * as notificationService from '../../services/notificationService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await notificationService.getNotifications();
    setNotifications(res.notifications || []);
  };

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load notifications');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const markOne = async (id) => {
    setBusy(true);
    try {
      await notificationService.markAsRead(id);
      await load();
    } catch (err) {
      setError(err.message || 'Could not update notification');
    } finally {
      setBusy(false);
    }
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await notificationService.markAllAsRead();
      await load();
    } catch (err) {
      setError(err.message || 'Could not mark all as read');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1>Notifications</h1>
            <p>Order, payment, and message updates.</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost-dark btn--sm"
            disabled={busy || !notifications.some((n) => !n.read_status)}
            onClick={markAll}
          >
            Mark all read
          </button>
        </header>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {loading ? (
          <LoadingSpinner label="Loading notifications…" />
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <h2>All caught up</h2>
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          <div className="review-list">
            {notifications.map((n) => (
              <article
                key={n.id}
                className="review-item"
                style={{ opacity: n.read_status ? 0.72 : 1 }}
              >
                <div className="review-item__meta">
                  <strong>{n.title}</strong>
                  <span className={`badge badge--${n.type || 'pending'}`}>{n.type}</span>
                </div>
                <p>{n.message}</p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.55rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#4d6358', fontSize: '0.85rem' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </span>
                  {!n.read_status ? (
                    <button
                      type="button"
                      className="btn btn--ghost-dark btn--sm"
                      disabled={busy}
                      onClick={() => markOne(n.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Notifications;
