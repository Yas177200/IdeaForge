import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import api from './../api';

export default function LikeButton({cardId}) {
    const [count, setCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(()=> {
        let mounted = true;
        (async () => {
            try{
                const {data} = await api.get(`cards/${cardId}/likes`, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                if (mounted) {
                    setCount(data.count);
                    setLiked(Boolean(data.likedByMe));
                }
            }catch (err){
                console.error('Failed to load like status', err);
            } finally{
                if (mounted) setLoading(false);
            }
        })();
        return () => {mounted = false; };
    }, [cardId, token]);

    const toggle = async () => {
        try{
            const { data } = await api.post(`/cards/${cardId}/like`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setLiked(data.liked);
            setCount(c => c + (data.liked ? 1 : -1));
        }catch (err){
            console.error('Like toggle failed', err);
        }
    };

    if (loading) return <button className="btn btn-outline" disabled>...</button>

    return (
        <button className={`btn ${liked? 'btn-primary' : 'btn-outline'}`} onClick={toggle}>
            {liked ? '❤️' : '🩶'}  {count}
        </button>
    )
}

LikeButton.propTypes = {
    cardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};