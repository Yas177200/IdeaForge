import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../api';
import ProjectTile from '../Components/ProjectTile';
import '../css/dashbaord.css'

export default function Dashboard() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const [tab, setTab] = useState('MINE'); 
  const [mine, setMine] = useState([]);
  const [joined, setJoined] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('NEWEST'); 

  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          api.get('/projects/mine'),
          api.get('/projects/joined')
        ]);
        if (!alive) return;
        setMine(a.data.projects || []);
        setJoined(b.data.projects || []);
        console.log(a.data.projects, b.data.projects, '❌❌❌❌❌❌');
        setError('');
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load dashboard');
      }
    })();
    return () => { alive = false; };
  }, []);

  const filterAndSort = (list) => {
    const ql = q.trim().toLowerCase();
    let arr = !ql ? list : list.filter(p => {
      const inName = p.name?.toLowerCase().includes(ql);
      const inTags = (p.tags || []).some(t => t.toLowerCase().includes(ql));
      return inName || inTags;
    });

    switch (sort) {
      case 'OLDEST':
        arr = arr.slice().sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'NAME':
        arr = arr.slice().sort((a,b) => a.name.localeCompare(b.name));
        break;
      case 'OPEN':
        arr = arr.slice().sort((a,b) => (b.openCards||0) - (a.openCards||0));
        break;
      case 'NEWEST':
      default:
        arr = arr.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return arr;
  };

  const list = tab === 'MINE' ? filterAndSort(mine) : filterAndSort(joined);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-wrap">
      <h1>Dashboard</h1>

      <div className="db-controls">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            className={tab === 'MINE' ? 'active' : ''}
            onClick={() => setTab('MINE')}
            aria-selected={tab === 'MINE'}
          >
            My Projects
          </button>
          <button
            role="tab"
            className={tab === 'JOINED' ? 'active' : ''}
            onClick={() => setTab('JOINED')}
            aria-selected={tab === 'JOINED'}
          >
            Joined
          </button>
        </div>

        <div className="search">
          <input
            placeholder="Search by name or tag…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="sort">
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="NEWEST">Newest</option>
            <option value="OLDEST">Oldest</option>
            <option value="NAME">Name (A–Z)</option>
            <option value="OPEN">Open cards (high → low)</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          <Link className="btn btn-outline" to="/projects/new">Create Project</Link>
          <Link className="btn btn-outline" to="/projects/join">Join Project</Link>
        </div>
      </div>

      <div className="project-grid">
        {list.map(p => (
          <ProjectTile key={p.id} project={p} showInvite={tab === 'MINE'} />
        ))}
        {list.length === 0 && <p className="muted">No projects match your filters.</p>}
      </div>
    </div>
  );
}
