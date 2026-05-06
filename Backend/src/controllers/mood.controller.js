const { detectMood } = require("../services/recommendation.service")
const userModel = require("../models/user.model")

async function getRecommendation(req, res) {

    try {

        const { mood } = req.body

        if (!mood) return res.status(400).json({ message: "Mood is requied" })

        const songs = await detectMood(mood, req.user)

        if (!songs || songs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No songs found for this mood'
            });
        }

        res.json({
            success: true,
            mood,
            songs: songs.map(s => ({
                title: s.title,
                youtubeId: s.youtubeId,
                channel: s.channel,
            })),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

module.exports = {
    getRecommendation
}