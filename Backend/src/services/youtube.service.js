const axios = require('axios');

const MOOD_QUERIES = {
    happy: 'happy songs bollywood latest',
    sad: 'emotional sad songs hindi',
    surprised: 'exciting upbeat songs',
    neutral: 'chill lofi music',
};

async function searchYouTube(mood) {
    try {
        const query = MOOD_QUERIES[mood] || MOOD_QUERIES.neutral;

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.YOUTUBE_API_KEY,
                q: query,
                type: 'video',
                part: 'snippet',
                maxResults: 20,
                videoCategoryId: '10', // Music
            },
        });

        const videos = response.data.items;

        if (!videos || videos.length === 0) {
            console.warn('YouTube returned no results');
            return [];  // return empty array, NOT null/undefined
        }

        if (!videos?.length) return null;

        // Return first 3 videos
        return videos.slice(0, 3).map(v => ({
            videoId: v.id.videoId,
            title: v.snippet.title,
            channel: v.snippet.channelTitle,
        }));
    } catch (error) {
        console.error('YouTube API error:', error.message);
        return [];
    }
}

module.exports = { searchYouTube };