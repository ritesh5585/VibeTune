const mongoose = require("mongoose")

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required for blacklisting"]
    },
}, {
    timestamps: true
}
)

const blackListModel = mongoose.model("blacklist", blacklistSchema)

module.exports = blackListModel