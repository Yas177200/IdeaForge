// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../Api';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data.user))
    .catch(() => setUser(null));
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (user === null) {
    return <p>Loading your dashboard…</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {user.name}!</h1>
      <p>Email: {user.email}</p>

      {/* TODO: Replace with real “My Projects” & “Joined Projects” lists */}
      <section>
        <h2>My Projects</h2>
        <p>(Coming soon…)</p>
      </section>
      <section>
        <h2>Joined Projects</h2>
        <p>(Coming soon…)</p>
      </section>
    </div>
  );
}
