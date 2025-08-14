import PropTypes from "prop-types";
import { useState } from "react";
import api from "../api";
import "../css/cards.css";
import CommentsThread from "./CommentsThread";
import EditCardForm from "./EditCardForm";
import LikeButton from "./LikeButton";

export default function CardsList({ cards, onCardUpdated }) {
  if (!cards.length) return <p>No cards yet.</p>;
  return (
    <ul className="cards-list">
      {cards.map(card => (
        <CardRow key={card.id} card={card} onCardUpdated={onCardUpdated} />
      ))}
    </ul>
  );
}

function CardRow({ card, onCardUpdated }) {
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthor = me?.id === card.authorId;

  const toggleCompleted = async () => {
    if (busy) return;
    setBusy(true);
    const optimistic = { ...card, completed: !card.completed };
    onCardUpdated(optimistic);
    try {
      const { data } = await api.patch(`/cards/${card.id}`, { completed: optimistic.completed });
      onCardUpdated(data.card);
    } catch (e) {
      onCardUpdated(card);
      console.error("Failed to toggle completed", e);
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = (updated) => {
    onCardUpdated(updated);
    setEditing(false);
  };

  return (
    <li className="card-item">
      <div className="card-head">
        <span className="card-type">{card.type}</span>
        <span className={`card-status ${card.completed ? "done" : "open"}`}>
          {card.completed ? "Completed" : "Open"}
        </span>
      </div>

      {!editing ? (
        <>
          <strong>{card.title}</strong>
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt="card"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
          {card.description && <p>{card.description}</p>}

          <div className="card-actions">
            <LikeButton cardId={card.id} />
            <button className="btn btn-outline" onClick={() => setShowComments(v => !v)}>
              {showComments ? "Hide Comments" : "Show Comments"}
            </button>
            {isAuthor && (
              <button className="btn btn-outline" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            <span><input type="checkbox" checked={card.completed} onChange={toggleCompleted} disabled={busy} /></span>            
          </div>

          {showComments && (
            <div className="card-comments">
              <CommentsThread cardId={card.id} />
            </div>
          )}
        </>
      ) : (
        <EditCardForm card={card} onSaved={handleSaved} onCancel={() => setEditing(false)} />
      )}
    </li>
  );
}

CardsList.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      completed: PropTypes.bool.isRequired,
      authorId: PropTypes.number // used to gate the Edit button
    })
  ).isRequired,
  onCardUpdated: PropTypes.func.isRequired
};
