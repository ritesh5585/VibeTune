import { useState, useCallback } from 'react';
import { getRecommendations } from "../api/recommend.api";


export const useRecommendation = () => {

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchSongs = useCallback(async (mood) => {

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/mood/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood }),
            });

            const data = await response.json();
            setSongs(data.songs || []);

            // const data = await getRecommendations(mood);
            // setSongs(data);
        } catch (err) {
            console.error("API error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [])

    return { songs, fetchSongs };
};