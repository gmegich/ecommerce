import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const res = await adminService.getUsers();
    setUsers(res.users || []);
  };

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load users');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onStatus = async (id, account_status) => {
    setBusyId(id);
    try {
      await adminService.updateUser(id, { accountStatus: account_status });
      await load();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="page__header">
        <h1>Manage users</h1>
        <p>View accounts and update status.</p>
      </header>
      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge--active">{u.role}</span>
                  </td>
                  <td>
                    <select
                      value={u.account_status || 'active'}
                      disabled={busyId === u.id}
                      onChange={(e) => onStatus(u.id, e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="suspended">suspended</option>
                      <option value="pending">pending</option>
                    </select>
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

export default ManageUsers;
