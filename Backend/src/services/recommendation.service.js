const Song = require('../models/songs.model');
const { searchYouTube } = require('./youtube.service');

async function detectMood(mood, user = null) {
    try {
        const recentIds = user?.history?.slice(-10)
            .map(h => h.songId?.toString()) || [];

        // Step 1: DB se lo
        const dbSongs = await Song.find({
            mood,
            videoId: { $nin: recentIds }, // Recently played filter
        }).lean();

        console.log(`📀 DB songs for "${mood}": ${dbSongs.length}`);

        // DB mein enough songs hain — YouTube mat call karo
        if (dbSongs.length >= 8) {
            return dbSongs
                .sort(() => 0.5 - Math.random())
                .slice(0, 8);
        }

        // Step 2: DB mein kam songs — YouTube try karo
        console.log(`🔄 DB songs kam hain, YouTube try kar rahe hain...`);
        const ytSongs = await searchYouTube(mood);

        // Step 3: YouTube songs DB mein save karo (future ke liye)
        if (ytSongs.length > 0) {
            const savePromises = ytSongs.map(song =>
                Song.findOneAndUpdate(
                    { videoId: song.videoId },
                    song,
                    { upsert: true, new: true }
                ).catch(() => null) // Duplicate error ignore karo
            );
            await Promise.all(savePromises);
            console.log(`💾 ${ytSongs.length} new songs saved to DB`);
        }

        // Step 4: Dono mix karo
        const combined = [...dbSongs, ...ytSongs];

        // Step 5: Agar sab fail — koi bhi mood ke songs do
        if (combined.length === 0) {
            console.warn(`⚠️ No songs found for "${mood}", using any available songs`);
            return await Song.find()
                .sort(() => 0.5 - Math.random())
                .limit(8)
                .lean();
        }

        return combined
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

    } catch (error) {
        console.error('Error in detectMood:', error);
        return await Song.find().limit(8).lean();
    }
}

module.exports = { detectMood };