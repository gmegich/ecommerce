import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, sellerProfile, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    county: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      county: user.county || '',
    });
  }, [user]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      await updateProfile(form);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-page__inner">
        <header className="profile-header">
          <div>
            <h1>My profile</h1>
            <p>
              Signed in as <strong>{user.email}</strong> · role:{' '}
              <span className="profile-role">{user.role}</span>
            </p>
          </div>
          <button type="button" className="btn btn--ghost-dark" onClick={logout}>
            Log out
          </button>
        </header>

        {sellerProfile ? (
          <section className="profile-seller">
            <h2>Seller business</h2>
            <p>
              <strong>{sellerProfile.business_name}</strong>
            </p>
            <p>Verification: {sellerProfile.verification_status}</p>
            {sellerProfile.business_location ? (
              <p>Location: {sellerProfile.business_location}</p>
            ) : null}
          </section>
        ) : null}

        <form className="profile-form" onSubmit={onSubmit}>
          {message ? <div className="profile-ok">{message}</div> : null}
          {error ? <div className="profile-err">{error}</div> : null}

          <div className="profile-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={onChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={onChange} />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={onChange} />
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

          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Profile;
