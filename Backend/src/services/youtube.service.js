const axios = require("axios")

const MOOD_QUERIES = {
    happy: ['happy songs bollywood', 'party hits hindi', 'upbeat songs'],
    sad: ['sad songs hindi', 'emotional bollywood', 'breakup songs'],
    surprised: ['exciting upbeat songs', 'energetic hindi songs', 'hype songs'],
    neutral: ['chill lofi hindi', 'peaceful music', 'calm songs'],
    angry: ['angry rap songs', 'intense hindi songs', 'power songs'],
    romantic: ['romantic hindi songs', 'love songs bollywood', 'valentine songs'],
    energetic: ['workout songs hindi', 'gym motivation songs', 'fast beats'],
    anxious: ['calming music', 'relaxing songs', 'meditation music'],
};

async function searchYouTube(mood) {
    try {
        const queries = MOOD_QUERIES[mood] || MOOD_QUERIES.neutral;

        // ✅ Random query pick karo — har baar alag results
        const query = queries[Math.floor(Math.random() * queries.length)];

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.YTAPI_KEY,
                q: query,
                type: 'video',
                part: 'snippet',
                maxResults: 20,          
                videoCategoryId: '10',
                relevanceLanguage: 'hi', 
                order: 'relevance',
            },
        });

        const videos = response.data.items;
        if (!videos || videos.length === 0) return [];

        const shuffled = videos.sort(() => 0.5 - Math.random());

        return shuffled.slice(0, 10).map(v => ({  // ✅ 10 return karo
            videoId: v.id.videoId,
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
            thumbnail: v.snippet.thumbnails?.medium?.url,
        }));

    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        return [];
    }
}

module.exports = searchYouTube