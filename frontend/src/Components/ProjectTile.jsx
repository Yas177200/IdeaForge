import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CopyInviteButton from './CopyInviteButton';
import MembersModal from './MembersModal';

export default function ProjectTile({ project, showInvite }) {
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(Number(project.pendingMembers || 0));

  const badgeClass = pendingCount > 0 ? 'danger' : 'ok';

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
        {showInvite && (
        <button
          className="btn btn-outline btn-members"
          onClick={() => setShowModal(true)}
          title="Approve/decline pending members"
        >
          Pending Members
          {pendingCount > 0 && (
            <span className={`badge-overlay ${badgeClass}`}>{pendingCount}</span>
          )}
        </button>

        )}
      </div>

      {showModal && (
        <MembersModal
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowModal(false)}
          onPendingDelta={(d) => setPendingCount(c => Math.max(0, c + d))}
        />
      )}
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
    openCards: PropTypes.number,
    pendingMembers: PropTypes.number
  }).isRequired,
  showInvite: PropTypes.bool
};
