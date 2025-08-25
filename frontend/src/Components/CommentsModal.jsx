import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';
import '../css/comments.css';

export default function CommentsModal({ card, onClose }) {
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/cards/${card.id}/comments`);
      setItems(data.comments || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load comments');
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [card.id]);

  const add = async () => {
    const content = text.trim();
    if (!content) return;
    try {
      const { data } = await api.post(`/cards/${card.id}/comments`, { content });
      setItems(prev => [...prev, data.comment]);
      setText('');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add comment');
    }
  };

  const startEdit = (c) => { setEditingId(c.id); setEditText(c.content); };
  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const saveEdit = async (id) => {
    const content = editText.trim();
    if (!content) return;
    try {
      await api.patch(`/comments/${id}`, { content });
      setItems(prev => prev.map(c => c.id === id ? { ...c, content } : c));
      cancelEdit();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to edit comment');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal large" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">Comments — {card.title}</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="comments-wrap">
          {items === null ? <p>Loading…</p> : items.length === 0 ? <p className="muted">No comments yet.</p> : (
            <ul className="comments-list">
              {items.map(c => (
                <li key={c.id} className="comment-item">
                  <div className="comment-meta">
                    <span className="author">{c.authorName || c.authorId}</span>
                    <span className="time">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>

                  {editingId === c.id ? (
                    <div className="comment-edit">
                      <textarea rows="3" value={editText} onChange={e => setEditText(e.target.value)} />
                      <div className="row-actions">
                        <button className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                        <button className="btn btn-primary" onClick={() => saveEdit(c.id)} disabled={!editText.trim()}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-body">{c.content}</p>
                      {(me?.id === c.authorId) && (
                        <div className="row-actions">
                          <button className="btn btn-outline" onClick={() => startEdit(c)}>Edit</button>
                          <button className="btn btn-primary" onClick={() => remove(c.id)}>Delete</button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="comment-new">
          <textarea rows="2" value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment…" />
          <button className="btn btn-primary" onClick={add} disabled={!text.trim()}>Add Comment</button>
        </div>
      </div>
    </div>
  );
}

CommentsModal.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};
