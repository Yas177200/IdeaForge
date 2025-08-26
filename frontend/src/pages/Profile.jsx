import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import '../css/profile.css';

export default function Profile() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const [me, setMe] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(!me);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [name, setName] = useState(me?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(me?.avatarUrl || '');
  const [bio, setBio] = useState(me?.bio || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busyInfo, setBusyInfo] = useState(false);
  const [busyPwd, setBusyPwd] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!me) {
      (async () => {
        try {
          const { data } = await api.get('/me');
          if (!alive) return;
          setMe(data.user);
          setName(data.user.name || '');
          setAvatarUrl(data.user.avatarUrl || '');
          setBio(data.user.bio || '');
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
        } catch (e) {
          setErr(e.response?.data?.message || 'Failed to load profile');
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
    return () => { alive = false; };
  }, []);
  
  const saveInfo = async (e) => {
    e?.preventDefault?.();
    setBusyInfo(true); setMsg(''); setErr('');
    try {
      const { data } = await api.patch('/me', { name, avatarUrl, bio });
      setMe(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMsg('Profile updated successfully.');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setBusyInfo(false);
    }
  };

  const changePwd = async (e) => {
    e?.preventDefault?.();
    setBusyPwd(true); setMsg(''); setErr('');
    try {
      await api.patch('/me/password', { oldPassword, newPassword });
      setMsg('Password updated.');
      setOldPassword(''); setNewPassword('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update password');
    } finally {
      setBusyPwd(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {(msg || err) && (
        <p className={`flash ${err ? 'flash-err' : 'flash-ok'}`}>
          {err || msg}
        </p>
      )}

      <section className="profile-grid">
        <div className="profile-card">
          <h2>Profile Info</h2>
          <div className="avatar-row">
            <div className="avatar-preview">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" onError={(e)=>{e.currentTarget.style.display='none';}} />
              ) : (
                <div className="avatar-fallback">{(name || 'U?').slice(0,2).toUpperCase()}</div>
              )}
            </div>
            <div className="avatar-hint">
              <p className="muted">Paste an image URL for your avatar. (Uploads coming later.)</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={saveInfo}>
            <label>
              <span>Name</span>
              <input value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              <span>Avatar URL</span>
              <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://…" />
            </label>
            <label>
              <span>Bio</span>
              <textarea rows="4" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us a bit…" />
            </label>

            <div className="row-end">
              <button className="btn btn-primary" disabled={busyInfo || !name.trim()}>
                {busyInfo ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-card">
          <h2>Change Password</h2>
          <form className="form-grid" onSubmit={changePwd}>
            <label>
              <span>Old Password</span>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            </label>
            <label>
              <span>New Password</span>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </label>
            <div className="row-end">
              <button className="btn btn-outline" disabled={busyPwd || !oldPassword || newPassword.length < 6}>
                {busyPwd ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
