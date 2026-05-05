const id3 = require("node-id3")
const songModel = require("../models/songs.model")

async function createSongs(req, res) {
    try {
        const { title, youtubeId, genre, mood } = req.body

        if (!title || !youtubeId || !mood) return res.status(400).json({
            success: false,
            message: "Missing required fields",
        })

        const song = await songModel.create({
            title,
            youtubeId,
            genre,
            mood
        })

        res.status(200).json({
            success: true,
            message: "Song created",
            song,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }

}

async function getSongs(req, res) {
    try {
        const songs = await songModel.find()

        res.status(200).json({
            sucess: true,
            count: songs.length,
            songs
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}
module.exports = {
    createSongs,
    getSongs
}