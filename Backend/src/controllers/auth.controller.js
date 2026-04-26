const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const blacklist = require("../models/blacklist.model")
const { default: mongoose } = require("mongoose")
const redis = require("../config/cache")

async function registerUser(req, res) {
    const { username, email, password } = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exist with email or username"
        })
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

    res.cookie("token", token)

    return res.status(201).json({
        message: " User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}

async function loginUser(req, res) {
    const { username, email, password } = req.body

    const user = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    }).select("+password")
    if (!user) {
        return res.status(400).json({
            message: " user not availble please register to login"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(401).json({
            message: " inavlif password"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username
    },
        process.env.JWT,
        { expiresIn: "3d" }
    )

    res.cookie("token", token)

    return res.status(201).json({
        message: " user logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function logOutUser(req, res) {

    const token = req.cookies?.token
    
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    await redis.set(token, Date.now().toString())

    res.status(200).json({
        message: "Loggout successfully"
    });
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        res.status(200).json({
            message: " user fetched successfully",
            user
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    logOutUser,
    getMe,

}