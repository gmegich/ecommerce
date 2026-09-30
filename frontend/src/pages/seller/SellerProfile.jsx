import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as sellerService from '../../services/sellerService';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/marketplace.css';

const SellerProfile = () => {
  const { sellerProfile, refreshUser } = useAuth();
  const [form, setForm] = useState({
    business_name: '',
    business_description: '',
    business_location: '',
    contact_information: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    sellerService
      .getProfile()
      .then((profile) => {
        if (!active) return;
        const src = profile || sellerProfile || {};
        setForm({
          business_name: src.business_name || '',
          business_description: src.business_description || '',
          business_location: src.business_location || '',
          contact_information: src.contact_information || '',
        });
      })
      .catch(() => {
        if (!active || !sellerProfile) return;
        setForm({
          business_name: sellerProfile.business_name || '',
          business_description: sellerProfile.business_description || '',
          business_location: sellerProfile.business_location || '',
          contact_information: sellerProfile.contact_information || '',
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sellerProfile]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await sellerService.updateProfile(form);
      await refreshUser();
      setMessage('Seller profile updated');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading profile…" />;

  return (
    <div>
      <header className="page__header">
        <h1>Seller profile</h1>
        <p>
          Verification:{' '}
          <span className={`badge badge--${sellerProfile?.verification_status || 'pending'}`}>
            {sellerProfile?.verification_status || 'pending'}
          </span>
        </p>
      </header>

      {message ? <div className="alert alert--ok">{message}</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}

      <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <label className="field">
          Business name
          <input
            name="business_name"
            value={form.business_name}
            onChange={onChange}
            required
          />
        </label>
        <label className="field">
          Description
          <textarea
            name="business_description"
            rows={4}
            value={form.business_description}
            onChange={onChange}
          />
        </label>
        <label className="field">
          Location
          <input
            name="business_location"
            value={form.business_location}
            onChange={onChange}
          />
        </label>
        <label className="field">
          Contact information
          <textarea
            name="contact_information"
            rows={2}
            value={form.contact_information}
            onChange={onChange}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default SellerProfile;
