const songModels = require("../models/songs.model")

async function detectMood(mood) {

    const song = await songModels.find({ mood })

    if (!song.length) return await songModels.find().limit(3)

    const shuffled = song.sort(() => 0.5 - Math.random())

    return shuffled(0, 3)
}
module.exports = {
    detectMood
}