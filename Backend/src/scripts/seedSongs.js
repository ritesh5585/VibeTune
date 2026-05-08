
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Song = require('../models/songs.model');

const MOOD_QUERIES = {
    happy: ['happy songs bollywood', 'party hits hindi 2024', 'upbeat songs hindi'],
    sad: ['sad songs hindi', 'emotional bollywood songs', 'breakup songs hindi'],
    neutral: ['chill lofi hindi', 'peaceful hindi songs', 'calm bollywood'],
    angry: ['angry rap hindi', 'intense songs hindi', 'power songs bollywood'],
    romantic: ['romantic hindi songs 2024', 'love songs bollywood', 'soft romantic hindi'],
    energetic: ['workout songs hindi', 'gym motivation hindi', 'fast beats bollywood'],
    surprised: ['exciting upbeat hindi', 'energetic bollywood', 'fun songs hindi'],
    anxious: ['calming hindi music', 'relaxing songs hindi', 'meditation hindi'],
};

// Ek query se songs fetch karo
async function fetchFromYouTube(query, mood) {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.YTAPI_KEY,
                q: query,
                type: 'video',
                part: 'snippet',
                maxResults: 10,
                videoCategoryId: '10',
                relevanceLanguage: 'hi',
            },
        });

        return (response.data.items || []).map(v => ({
            videoId: v.id.videoId,
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            thumbnail: v.snippet.thumbnails?.medium?.url,
            mood,
            source: 'youtube',
        }));

    } catch (error) {
        console.error(` Error fetching "${query}":`, error.response?.data?.error?.message);
        return [];
    }
}

async function seedDatabase() {
    try {
        // DB connect karo
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' MongoDB connected');

        let totalSaved = 0;
        let totalSkipped = 0;

        for (const [mood, queries] of Object.entries(MOOD_QUERIES)) {
            console.log(`\n🎵 Processing mood: ${mood}`);

            for (const query of queries) {
                // Rate limit se bachao
                await new Promise(r => setTimeout(r, 200));

                const songs = await fetchFromYouTube(query, mood);
                console.log(`  🔍 "${query}" → ${songs.length} songs found`);

                for (const song of songs) {
                    try {
                        await Song.findOneAndUpdate(
                            { videoId: song.videoId },  //  Duplicate check
                            song,
                            { upsert: true, new: true }
                        );
                        totalSaved++;
                    } catch (err) {
                        totalSkipped++;
                    }
                }
            }
        }

        // Final count
        const total = await Song.countDocuments();
        console.log(`\n Seeding complete!`);
        console.log(`📊 Saved: ${totalSaved} | Skipped: ${totalSkipped} | Total in DB: ${total}`);

        // Mood wise breakdown
        for (const mood of Object.keys(MOOD_QUERIES)) {
            const count = await Song.countDocuments({ mood });
            console.log(`  ${mood}: ${count} songs`);
        }

    } catch (error) {
        console.error(' Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected');
    }
}

seedDatabase();