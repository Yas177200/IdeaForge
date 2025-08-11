import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from 'react-router-dom';
import api from "../api";
import CardsList from "../Components/CardsList";
import NewCardForm from "../Components/NewCardForm";
import '../css/projectPage.css'

export default function ProjectPage() {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to='/' replace />

    const { id } = useParams();
    const [cards, setCards] = useState(null);
    const [error, setError] = useState('');

    const fetchCards = useCallback(async () => {
        try{
            const {data} = await api.get(`/projects/${id}/cards`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCards(data.cards);
        }catch (err){
            setError(err.response?.data?.message || 'Failed to load cards');
        }
    }, [id, token]);

    useEffect(() => { fetchCards(); }, [fetchCards]);

    if (cards === null) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return(
        <div className="project-page">
            <div className="topbar">
                <Link to='/'>🔙</Link>
            </div>

            <NewCardForm projectId={id} onCreated={fetchCards} />
            <h2>Cards</h2>
            <CardsList cards={cards} />
        </div>
    );
}