const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")
const redis = require("../config/cache")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const asyncHandler = require("../utils/asyncHandler")

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (isUserAlreadyExists) {
        throw new ApiError(400, "User already exist with email or username")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT,
        {
            expiresIn: "1d"
        }
    )

    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    return res.status(201).json(new ApiResponse(201, {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
    }, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    const user = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    }).select("+password")

    if (!user) {
        throw new ApiError(404, "User not available please register to login")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username
    },
        process.env.JWT,
        { expiresIn: "3d" }
    )

    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    })

    return res.status(200).json(new ApiResponse(200, {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
    }, "User logged in successfully"))
})

const logOutUser = asyncHandler(async (req, res) => {
    const token = req.cookies?.token
    
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    if (token) {
        await redis.set(token, Date.now().toString())
    }

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
})

const getMe = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    res.status(200).json(new ApiResponse(200, user, "User fetched successfully"))
})

module.exports = {
    registerUser,
    loginUser,
    logOutUser,
    getMe,
}