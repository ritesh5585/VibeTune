import axios from "axios";

export const getRecommendations = async (mood) => {
    const res = await axios.post("/api/mood/recommend", { mood });
    return res.data.songs;
};