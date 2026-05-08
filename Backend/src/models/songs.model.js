const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    channel: {
        type: String,
        default: 'Unknown',
    },
    thumbnail: {
        type: String,
        default: null,
    },
    mood: {
        type: String,
        required: true,
        enum: ['happy', 'sad', 'neutral', 'angry', 'romantic', 'energetic', 'surprised', 'anxious'],
        index: true,
    },
    source: {
        type: String,
        default: 'youtube',
    },
    playCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const songModel = mongoose.model('Song', songSchema);


module.exports = songModel