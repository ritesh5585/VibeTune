const mongoose = require("mongoose")

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    youtubeId: {
        type: String,
        required: true
    },
    genre: {
        type: String,
    },
    mood: {
        type: String,
        required: true
    }
})

const songModel = mongoose.model("songs", songSchema)

module.exports = songModel