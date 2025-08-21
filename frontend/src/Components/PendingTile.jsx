import PropTypes from 'prop-types';

export default function PendingTile({ project }) {
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
      </div>
    </div>
  );
}

PendingTile.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    shortSummary: PropTypes.string,
    tags: PropTypes.array
  }).isRequired
};
