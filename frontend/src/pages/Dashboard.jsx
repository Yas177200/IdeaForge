import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../Api';
import MyProjects from '../Components/MyProjects';
import JoinedProjects from '../Components/JoinedProjects';
import '../css/dashbaord.css'

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const [mine, setMine]     = useState(null);
  const [joined, setJoined] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!token) return;
    api.get('/projects/mine', { headers: { Authorization: `Bearer ${token}` } })
       .then(res => setMine(res.data.projects))
       .catch(err => setError(err.response?.data?.message));
    api.get('/projects/joined', { headers: { Authorization: `Bearer ${token}` } })
       .then(res => setJoined(res.data.projects))
       .catch(err => setError(err.response?.data?.message));
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (mine === null || joined === null) return <p>Loading projects…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="dashboard">
      <h1>Welcome back!</h1>
      <div className="dashboard-actions">
        <Link to="/projects/new"><button>Create Project</button></Link>
        <Link to="/projects/join"><button>Join Project</button></Link>
      </div>

      <section>
        <h2>My Projects</h2>
        <MyProjects projects={mine} />
      </section>

      <section>
        <h2>Joined Projects</h2>
        <JoinedProjects projects={joined} />
      </section>
    </div>
  );
}
