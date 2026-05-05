const recommendationServices = require("../services/recommendation.service")
const userModel = require("../models/user.model")

async function getRecommendation(req, res) {
    try {
        const { mood } = req.body
        const userId = req.user?.id

        if (!mood) return res.status(400).json({
            success: false,
            message: " mood is required"
        })

        const songs = await recommendationServices.detectMood(mood)

        if (userId && songs.length > 0) {
            await userModel.findByIdAndUpdate(userId, {
                $push: {
                    history: {  
                        mood,
                        songId: songs[0]._id, // save first recommended song
                        playedAt: new Date(),
                    },
                },
            });
        }


        return res.status(200).json({
            success: true,
            message: "done",
            songs
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    getRecommendation
}