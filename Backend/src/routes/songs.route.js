const express = require("express")
const {
    createSongs,
    getSongs
} = require("../controllers/song.controller")

const router = express.Router()

router.post("/createSong", createSongs)
router.get("/getsongs", getSongs)

module.exports = router