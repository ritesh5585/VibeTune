const { Router } = require("express")
const { registerUser, loginUser, logOutUser, getMe } = require("../controllers/auth.controller")
const {authUser} = require("../middlewares/auth.middleware")


const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logOutUser)

router.get("/getme", authUser, getMe)

module.exports = router