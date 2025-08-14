import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';
import '../css/comments.css';

export default function CommentsThread({ cardId }) {
  const token = localStorage.getItem('token');
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const myId = me?.id;

  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/cards/${cardId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(data.comments);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load comments');
    }
  };


  useEffect(() => { load(); }, [cardId]);

  const add = async e => {
    e.preventDefault();
    setErr('');
    if (!text.trim()) return;
    try {
      const { data } = await api.post(
        `/cards/${cardId}/comments`,
        { content: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(arr => [...arr, data.comment]);
      setText('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to add comment');
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(arr => arr.filter(c => c.id !== id));
    } catch (e) {
      setErr(e.response?.data?.message || 'Not allowed to delete this comment');
    }
  };

  if (comments === null) return <p>Loading comments…</p>;

  return (
    <div className="comments">
      {err && <p className="error">{err}</p>}

      {comments.length ? (
        <ul className="comments-list">
          {comments.map(c => (
            <li key={c.id} className="comment">
                <div className="comment-meta">
                    <span className="author">{c.authorName || me.name || 'You'}</span>
                    {c.authorId === myId && (
                    <button className="link danger" onClick={() => remove(c.id)}>
                        Delete
                    </button>
                    )}
                </div>
                <p>{c.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No comments yet.</p>
      )}

      <form className="comment-form" onSubmit={add}>
        <textarea
          rows="2"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Add Comment</button>
      </form>
    </div>
  );
}

CommentsThread.propTypes = {
  cardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
