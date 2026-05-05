const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const redis = require("../config/cache")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const authUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        throw new ApiError(401, "Token not found")
    }
    const isTokenBlacklistted = await redis.get(token)

    if(isTokenBlacklistted){
        throw new ApiError(401, "Invalid token or already logged out")
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT
        )

        req.user = decoded

        next()
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token")
    }
})

module.exports = {
    authUser
}
