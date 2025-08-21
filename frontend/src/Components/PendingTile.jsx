import PropTypes from 'prop-types';
import api from '../api';

export default function PendingTile({ project, onCancelled }) {
  const date = project.requestDate
    ? new Date(project.requestDate).toLocaleString()
    : '';

  const cancel = async () => {
    if (!confirm('Cancel this join request?')) return;
    try {
      await api.delete(`/projects/${project.id}/cancel/request`);
      onCancelled?.(project.id);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="project-tile pending">
      <div className="pt-head">
        <h3 className="pt-title">{project.name}</h3>
        {project.tags?.length ? (
          <div className="pt-tags">
            {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        ) : null}
      </div>

      {project.shortSummary && (
        <p className="pt-summary small">{project.shortSummary}</p>
      )}

      <div className="pt-pending-note">
        <span className="badge-pending">Pending approval</span>
        {date && <span className="request-date">Requested: {date}</span>}
      </div>

      <div className="pt-actions">
        <button className="btn btn-outline" onClick={cancel}>Cancel request</button>
      </div>
    </div>
  );
}

PendingTile.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    shortSummary: PropTypes.string,
    tags: PropTypes.array,
    requestDate: PropTypes.string
  }).isRequired,
  onCancelled: PropTypes.func
};
