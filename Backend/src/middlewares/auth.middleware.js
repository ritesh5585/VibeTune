const userModel = require("../models/user.model")
const blacklist = require("../models/blacklist.model")
const jwt = require("jsonwebtoken")
const redis = require("../config/cache")

async function authUser(req, res, next) {
    console.log(req.cookies)
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not found"
        })
    }
    const isTokenBlacklistted = await redis.get(token)

    if(isTokenBlacklistted){
        return res.status(401).json({
            message: "invalid token or already exist"
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT
        )

        req.user = decoded

        next()
    } catch (error) {
        console.log("invalid token from middleware", error)
    }
}

module.exports = {
    authUser
}
