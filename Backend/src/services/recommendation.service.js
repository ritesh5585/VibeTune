const songModels = require("../models/songs.model")
const searchYouTube = require("./youtube.service")

async function detectMood(mood, user = null) {
    try {
        // DB + YouTube DONO se lo, mix karo
        const [dbSongs, youtubeSongs] = await Promise.all([
            songModels.find({ mood }).lean(),
            searchYouTube(mood),
        ]);

        // History filter
        const recentIds = user?.history?.slice(-10)
            .map(h => h.songId?.toString()) || [];

        // DB songs format karo
        const formattedDb = dbSongs
            .filter(s => !recentIds.includes(s._id?.toString()))
            .map(s => ({ ...s, source: 'db' }));

        // YouTube songs format karo
        const formattedYt = youtubeSongs
            .map(s => ({ ...s, mood, source: 'youtube' }));

        // Mix karo — DB priority, YouTube fill karo
        const combined = [...formattedDb, ...formattedYt];

        if (combined.length === 0) {
            return await songModels.find().limit(5).lean();
        }

        // Shuffle aur 8 return karo
        return combined
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

    } catch (error) {
        console.error('Error in detectMood:', error);
        return await songModels.find().limit(5).lean();
    }
}

module.exports = {
    detectMood
}