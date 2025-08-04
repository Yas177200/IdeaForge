import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api';

export default function JoinProject() {
  const navigate = useNavigate();
  const [joinLink, setJoinLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post(
        '/projects/join',
        { joinLink },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // back to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join project');
    }
  };

  return (
    <div className="project-form">
      <h2>Join Project</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Invite Link
          <input
            value={joinLink}
            onChange={e => setJoinLink(e.target.value)}
            placeholder="Paste invite link UUID"
            required
          />
        </label>
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
