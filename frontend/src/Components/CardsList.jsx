import PropTypes from 'prop-types';
import LikeButton from './LikeButton';
import CommentsThread from './CommentsThread';

export default function CardsList({ cards }) {
  if (!cards.length) return <p>No cards yet.</p>;
  return (
    <ul className="cards-list">
      {cards.map(c => <CardRow key={c.id} card={c} />)}
    </ul>
  );
}

function CardRow({ card }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <li className="card-item">
      <div className="card-head">
        <span className="card-type">{card.type}</span>
        <span className={`card-status ${card.completed ? 'done' : 'open'}`}>
          {card.completed ? 'Completed' : 'Open'}
        </span>
      </div>

      <strong>{card.title}</strong>
      {card.description && <p>{card.description}</p>}

      <div className="card-actions">
        <LikeButton cardId={card.id} />
        <button className="btn btn-outline" onClick={() => setShowComments(v => !v)}>
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
      </div>

      {showComments && (
        <div className="card-comments">
          <CommentsThread cardId={card.id} />
        </div>
      )}
    </li>
  );
}

import { useState } from 'react';
CardsList.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool.isRequired
  })).isRequired
};
