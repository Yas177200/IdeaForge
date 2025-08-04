import React from 'react';
import PropTypes from 'prop-types';
import '../css/my-joined-projects.css'

export default function MyProjects({ projects }) {
  if (!projects.length) {
    return <p>You haven’t created any projects yet.</p>;
  }

  return (
    <ul>
      {projects.map(project => (
        <li key={project.id} className="project-item">
          <strong>{project.name}</strong>
          <p>{project.shortSummary}</p>
        </li>
      ))}
    </ul>
  );
}

MyProjects.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id:           PropTypes.number.isRequired,
      name:         PropTypes.string.isRequired,
      shortSummary: PropTypes.string.isRequired
    })
  ).isRequired
};
