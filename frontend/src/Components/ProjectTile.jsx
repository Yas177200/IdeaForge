import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CopyInviteButton from './CopyInviteButton';

export default function ProjectTile({ project, showInvite }) {
  return (
    <div className="project-tile">
      <div className="pt-head">
        <h3 className="pt-title">{project.name}</h3>
        {project.tags?.length ? (
          <div className="pt-tags">
            {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        ) : null}
      </div>

      <p className="pt-summary">{project.shortSummary}</p>

      <div className="pt-counts">
        <span className="pill open">{project.openCards} open</span>
        <span className="pill total">{project.totalCards} total</span>
      </div>

      <div className="pt-actions">
        <Link className="btn btn-outline" to={`/projects/${project.id}`}>Open</Link>
        {showInvite && project.joinLink && (
          <CopyInviteButton joinLink={project.joinLink} label="Copy Invite" />
        )}
      </div>
    </div>
  );
}

ProjectTile.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    shortSummary: PropTypes.string,
    tags: PropTypes.array,
    joinLink: PropTypes.string,
    totalCards: PropTypes.number,
    openCards: PropTypes.number
  }).isRequired,
  showInvite: PropTypes.bool
};
