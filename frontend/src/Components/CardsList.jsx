import PropTypes from "prop-types";
import '../css/cards.css'

export default function CardsList({ cards }) {
    if (!cards.length) return <p>No cards yet.</p>

    return (
        <ul className="cards-list">
            {cards.map(c=> (
                <li key={c.id} className="card-item">
                    <div className="card-head">
                        <span className="card-type">{c.type}</span>
                        <span>{c.id}</span>
                        <span className={`card-status ${c.completed ? 'done' : 'open'}`}>
                            {c.completed? 'Completed' : 'Open'}
                        </span>
                    </div>
                    <strong>{c.title}</strong>
                    <img src={c.imageUrl} alt="card image" />
                    {c.description && <p>{c.description}</p>}
                </li>
            ))}
        </ul>
    );
}


CardsList.PropTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        completed: PropTypes.bool.isRequired
    }))
}