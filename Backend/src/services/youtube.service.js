const axios = require('axios');

// Memory cache — server restart pe reset
const cache = new Map();

const MOOD_QUERIES = {
    happy: ['happy songs bollywood', 'party hits hindi'],
    sad: ['sad songs hindi', 'emotional bollywood'],
    neutral: ['chill lofi hindi', 'peaceful hindi songs'],
    angry: ['angry rap hindi', 'intense songs hindi'],
    romantic: ['romantic hindi songs', 'love songs bollywood'],
    energetic: ['workout songs hindi', 'gym motivation hindi'],
    surprised: ['exciting upbeat hindi', 'energetic bollywood'],
    anxious: ['calming hindi music', 'relaxing songs hindi'],
};

async function searchYouTube(mood) {
    const today = new Date().toDateString();
    const cacheKey = `${mood}_${today}`;

    //  Cache hit — API call mat karo
    if (cache.has(cacheKey)) {
        console.log(`📦 Cache hit: ${mood}`);
        const cached = cache.get(cacheKey);
        return [...cached].sort(() => 0.5 - Math.random());
    }

    try {
        const queries = MOOD_QUERIES[mood] || MOOD_QUERIES.neutral;
        const query = queries[Math.floor(Math.random() * queries.length)];

        console.log(`YouTube API call: "${query}"`);

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.YTAPI_KEY,
                q: query,
                type: 'video',
                part: 'snippet',
                maxResults: 20,
                videoCategoryId: '10',
                relevanceLanguage: 'hi',
            },
        });

        const videos = (response.data.items || []).map(v => ({
            videoId: v.id.videoId,
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            thumbnail: v.snippet.thumbnails?.medium?.url,
            mood,
            source: 'youtube',
        }));

        cache.set(cacheKey, videos);
        return [...videos].sort(() => 0.5 - Math.random());

    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error('YouTube API error:', errMsg);

        //  Quota check
        if (error.response?.status === 403) {
            console.warn('⚠️ YouTube quota exhausted — DB fallback active');
        }
        return []; // Empty return — DB fallback chalega
    }
}

module.exports = { searchYouTube };