import { Navigate } from 'react-router-dom';

export default function Profile() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const me = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="page-wrap">
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {me?.name}</p>
      <p><strong>Email:</strong> {me?.email}</p>
      <p className="muted">Edit UI coming later.</p>
    </div>
  );
}
