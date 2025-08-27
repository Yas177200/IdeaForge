import PropTypes from "prop-types";
import { useState } from "react";
import api from "../api";
import "../css/cards.css";
import CommentsModal from "./CommentsModal";
import EditCardForm from "./EditCardForm";
import LikeButton from "./LikeButton";

export default function CardsList({ cards, onCardUpdated, onOpenComments }) {
  if (!cards || !cards.length) return <p>No cards yet.</p>;
  return (
    <ul className="cards-list">
      {cards.map((card) => (
        <CardRow
          key={card.id}
          card={card}
          onCardUpdated={onCardUpdated}
          onOpenComments={onOpenComments}
        />
      ))}
    </ul>
  );
}

function CardRow({ card, onCardUpdated, onOpenComments }) {
  const safeUpdate = onCardUpdated || (() => {});
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const me = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthor = me?.id === card.authorId;
  const hasImage = !!card.imageUrl;

  const toggleCompleted = async () => {
    if (busy) return;
    setBusy(true);
    const optimistic = { ...card, completed: !card.completed };
    safeUpdate(optimistic);
    try {
      const { data } = await api.patch(`/cards/${card.id}`, {
        completed: optimistic.completed,
      });
      safeUpdate(data.card);
    } catch (e) {
      safeUpdate(card); // rollback
      console.error("Failed to toggle completed", e);
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = (updated) => {
    safeUpdate(updated);
    setEditing(false);
  };

  const openComments = () => {
    if (onOpenComments) onOpenComments(card);
    else setCommentsOpen(true);
  };

  return (
    <li className={`card-item ${hasImage ? "has-image" : "no-image"}`}>
      <div className="card-head">
        <span className="card-type">{card.type}</span>
        <span className={`card-status ${card.completed ? "done" : "open"}`}>
          {card.completed ? "Completed" : "Open"}
        </span>
      </div>

      {!editing ? (
        <>
          <div className="card-body">
            <h2 className="card-title" title={card.title}>{card.title}</h2>

            {hasImage && (
              <div className="card-media">
                <img
                  src={card.imageUrl}
                  alt="card"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            {card.description && (
              <p className="card-desc" title={card.description}>
                {card.description}
              </p>
            )}
          </div>

          <div className="card-actions">
            <LikeButton cardId={card.id} />
            <button className="btn btn-outline" onClick={openComments}>
              Comments
            </button>

            {isAuthor && (
              <button className="btn btn-outline" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}

            {isAuthor && (
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={card.completed}
                  onChange={toggleCompleted}
                  disabled={busy}
                />
              </label>
            )}
          </div>

          {!onOpenComments && commentsOpen && (
            <CommentsModal card={card} onClose={() => setCommentsOpen(false)} />
          )}
        </>
      ) : (
        <EditCardForm
          card={card}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />
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
      authorId: PropTypes.number,
    })
  ).isRequired,
  onCardUpdated: PropTypes.func,     
  onOpenComments: PropTypes.func,    
};
