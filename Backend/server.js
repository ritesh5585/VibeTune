require("dotenv").config()
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const app = require("./src/app.js")
const connect = require("./src/config/database.js")
connect()

app.listen(3000, () => {
    console.log("server is running on port: 3000")
})