import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import CardsList from '../components/CardsList';
import ProjectHeader from '../components/ProjectHeader';
import ProjectSubnav from '../components/ProjectSubnav';
import NewCardModal from '../components/NewCardModal';
import CommentsModal from '../components/CommentsModal';
import ChatPanel from '../components/ChatPanel';
import '../css/projectPage.css';

export default function ProjectPage() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('board');

  const [newCardOpen, setNewCardOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [commentsFor, setCommentsFor] = useState(null);

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load project');
    }
  }, [id]);

  const loadCards = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}/cards`);
      setCards(data.cards || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load cards');
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    loadCards();
  }, [loadProject, loadCards]);

  // updater passed to CardsList
  const handleCardUpdated = useCallback((updated) => {
    setCards(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  }, []);

  const filtered = cards.filter(c => {
    if (filter === 'OPEN') return !c.completed;
    if (filter === 'DONE') return !!c.completed;
    return true;
  });

  if (error) return <p className="error">{error}</p>;
  if (!project) return <p>Loading…</p>;

  return (
    <div className="project-page">
      <ProjectHeader
        projectId={id}
        onDeleted={() => navigate('/')}
        onUpdated={(p) => setProject(p)}
      />

      <ProjectSubnav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChat={() => setChatOpen(true)}
        onOpenNewCard={() => setNewCardOpen(true)}
        onBack={() => navigate('/')}
      />

      {activeTab === 'overview' ? (
        <section style={{ marginTop: '1rem' }}>
          <h2>Overview</h2>
          <p><strong>Owner:</strong> {project.ownerName}</p>
          {project.tags?.length ? (
            <p><strong>Tags:</strong> {project.tags.join(', ')}</p>
          ) : null}
          <h3>Full Description</h3>
          <p>{project.fullDescription || '—'}</p>
        </section>
      ) : (
        <section id="cards" style={{ marginTop: '1rem' }}>
          <div style={{ display:'flex', gap:'.5rem', margin:'.5rem 0' }}>
            <button className={`btn ${filter==='ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('ALL')}>All</button>
            <button className={`btn ${filter==='OPEN' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('OPEN')}>Open</button>
            <button className={`btn ${filter==='DONE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('DONE')}>Completed</button>
          </div>

          <CardsList
            cards={filtered}
            onCardUpdated={handleCardUpdated}
            onOpenComments={(card) => setCommentsFor(card)}
          />
        </section>
      )}

      {newCardOpen && (
        <NewCardModal
          projectId={id}
          onCreated={loadCards}
          onClose={() => setNewCardOpen(false)}
        />
      )}

      {commentsFor && (
        <CommentsModal
          card={commentsFor}
          onClose={() => setCommentsFor(null)}
        />
      )}

      <ChatPanel projectId={id} open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
