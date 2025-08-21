import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

export default function MembersModal({ projectId, projectName, onClose, onPendingDelta }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/members`);
      const list = (data.members || []).filter(m => (m.status || 'APPROVED') === 'PENDING');
      setPending(list);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load members');
      setPending([]);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const approve = async (userId) => {
    try {
      await api.patch(`/projects/${projectId}/members/${userId}`, { status: 'APPROVED' });
      setPending(arr => {
        const next = arr.filter(m => m.userId !== userId);
        onPendingDelta?.(-1);
        return next;
      });
    } catch (e) {
      alert(e.response?.data?.message || 'Approve failed');
    }
  };

  const decline = async (userId) => {
    if (!confirm('Decline (remove) this join request?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      setPending(arr => {
        const next = arr.filter(m => m.userId !== userId);
        onPendingDelta?.(-1);
        return next;
      });
    } catch (e) {
      alert(e.response?.data?.message || 'Decline failed');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{projectName} — Members</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>

        {error && <p className="error">{error}</p>}

        {pending === null ? (
          <p>Loading…</p>
        ) : pending.length === 0 ? (
          <p className="muted">No pending members 🎉</p>
        ) : (
          <ul className="pending-list">
            {pending.map(m => (
              <li key={m.userId} className="pending-row">
                <div className="info">
                  <div className="name">{m.name}</div>
                  <div className="sub">{m.email}</div>
                </div>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => approve(m.userId)}>Approve</button>
                  <button className="btn btn-outline" onClick={() => decline(m.userId)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

MembersModal.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  projectName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onPendingDelta: PropTypes.func
};
