const songModels = require("../models/songs.model")
const { searchYouTube } = require("./youtube.service")

async function detectMood(mood, user = null) {

    try {

        let songs = await songModels.find({ mood }).limit(5)

        if (songs.length == 0) {
            const youtubeResults = await searchYouTube(mood)

            if (youtubeResults) {
                songs = youtubeResults.map(video => ({
                    title: video.title,
                    youtubeId: video.videoId,
                    mood: mood,
                    source: 'youtube',
                }));

                // Filter recent songs
                if (user?.history?.length) {
                    const recent = user.history.slice(-5).map(h => h.songId?.toString());
                    songs = songs.filter(s => !recent.includes(s._id?.toString()));
                }

                return songs.sort(() => 0.5 - Math.random()).slice(0, 3);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        return await Song.find().limit(3);
    }

}

module.exports = {
    detectMood
}