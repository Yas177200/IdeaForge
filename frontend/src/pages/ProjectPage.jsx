import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import CardsList from '../components/CardsList';
import ProjectHeader from '../Components/ProjectHeader';
import NewCardForm from '../components/NewCardForm';
import '../css/projectPage.css'

export default function ProjectPage() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const { id } = useParams(); 
  const [cards, setCards] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); 

  const fetchCards = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}/cards`);
      setCards(data.cards);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cards');
    }
  }, [id]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleCardUpdated = (updated) => {
    setCards(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  if (cards === null) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;

  const filtered = cards.filter(c =>
    filter === 'ALL' ? true :
    filter === 'OPEN' ? !c.completed :
    c.completed
  );

  return (
    <div className="project-page">
      <div className="topbar">
        <Link to="/">← Back to Dashboard</Link>
      </div>
      <ProjectHeader
        projectId={id}
        onDelete={()=>navigate('/')}
        onUpdated={()=> {/* a;lksdf;alskdjf;alskjf;lksadlkjsdflkjfsdjkl;ljk;sdf */}}
      />

      <NewCardForm projectId={id} onCreated={fetchCards} />

      <div style={{ display: 'flex', gap: '.5rem', margin: '.5rem 0' }}>
        <button className={`btn ${filter==='ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('ALL')}>All</button>
        <button className={`btn ${filter==='OPEN' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('OPEN')}>Open</button>
        <button className={`btn ${filter==='DONE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('DONE')}>Completed</button>
      </div>

      <h2>Cards</h2>
      <CardsList cards={filtered} onCardUpdated={handleCardUpdated} />
    </div>
  );
}