const express = require("express")
const { getRecommendation } = require("../controllers/mood.controller")
const { authUser } = require("../middlewares/auth.middleware")

const router = express.Router()

router.post("/recommend", getRecommendation)

module.exports = router 