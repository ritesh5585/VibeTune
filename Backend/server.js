require("dotenv").config()
const app = require("./src/app.js")
const connect = require("./src/config/database.js")
connect()

app.listen(3000, () => {
    console.log("server is running on port: 3000")
})