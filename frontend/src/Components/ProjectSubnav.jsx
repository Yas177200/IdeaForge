import PropTypes from 'prop-types';
import '../css/nav.css';

export default function ProjectSubnav({ onOpenChat }) {
  return (
    <div className="subnav">
      <div className="subnav-left">
        <a href="/" className='subnav-link'>Back to Dashboard</a>
        <a href="#overview" className="subnav-link">Project Details</a>
        <a href="#cards" className="subnav-link">Cards</a>
      </div>
      <div className="subnav-right">
        <button className="btn btn-primary" onClick={onOpenChat}>Open Chat</button>
      </div>
    </div>
  );
}

ProjectSubnav.propTypes = {
  onOpenChat: PropTypes.func.isRequired
};
