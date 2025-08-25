import PropTypes from 'prop-types';
import '../css/nav.css';

export default function ProjectSubnav({
  activeTab, onTabChange, onOpenChat, onOpenNewCard, onBack
}) {
  return (
    <div className="subnav">
      <div className="subnav-left">
        <button className="btn btn-outline" onClick={onOpenChat}>Open Chat</button>
        <button className="btn btn-primary" onClick={onOpenNewCard}>Add Card</button>
      </div>
      <div className="subnav-right">
        <button
          className={`subnav-link ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`subnav-link ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => onTabChange('board')}
        >
          Board
        </button>
        <button className="btn btn-outline" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>
  );
}

ProjectSubnav.propTypes = {
  activeTab: PropTypes.oneOf(['board', 'overview']).isRequired,
  onTabChange: PropTypes.func.isRequired,
  onOpenChat: PropTypes.func.isRequired,
  onOpenNewCard: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
