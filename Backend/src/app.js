const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
let path = require("path")

const authRoutes = require("./routes/auth.route")
const songsRoutes = require("./routes/songs.route")
const moodRoutes = require("./routes/mood.route")
const errorHandler = require("./middlewares/error.middleware")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.static(path.join(__dirname, "../public/dist")));

app.use("/api/auth", authRoutes)
app.use("/api/song", songsRoutes)
app.use("/api/mood", moodRoutes)

app.use(errorHandler)

module.exports = app