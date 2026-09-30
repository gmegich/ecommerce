import { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const res = await adminService.getSellers();
    setSellers(res.sellers || []);
  };

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load sellers');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onVerify = async (id, verification_status) => {
    setBusyId(id);
    try {
      await adminService.updateSeller(id, { verification_status });
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
        <h1>Manage sellers</h1>
        <p>Approve or reject seller verification requests.</p>
      </header>
      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <LoadingSpinner label="Loading sellers…" />
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id}>
                  <td>{s.business_name}</td>
                  <td>{s.users?.name || s.user?.name || '—'}</td>
                  <td>{s.business_location || '—'}</td>
                  <td>
                    <select
                      value={s.verification_status || 'pending'}
                      disabled={busyId === s.id}
                      onChange={(e) => onVerify(s.id, e.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="deactivated">deactivated</option>
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

export default ManageSellers;
