const { detectMood } = require("../services/recommendation.service")
const userModel = require("../models/user.model")

async function getRecommendation(req, res) {

    try {

        const { mood } = req.body
        const user = req.user

        if (!mood) return res.status(400).json({ message: "Mood is requied" })

        const songs = await detectMood(mood, user)

        if (!songs || songs.length === 0) {
            console.error({
                error: 'No songs found',
                details: 'Songs array is empty or undefined',
                songsValue: songs,
                songsLength: songs?.length
            });
            return res.status(404).json({
                success: false,
                message: 'No songs found for this mood',
            });
        }

        res.json({
            success: true,
            mood,
            songs: songs.map(s => ({
                title: s.title,
                youtubeId: s.youtubeId || s.videoId, 
                channel: s.channel || s.channelTitle || 'Unknown',
                thumbnail: s.thumbnail || null,       
                source: s.source || 'unknown',       
            })),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

module.exports = {
    getRecommendation
}