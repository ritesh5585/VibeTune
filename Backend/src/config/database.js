const mongoose = require("mongoose")

async function connectToDb() {
    await mongoose.connect(process.env.MONGO_URI)

        .then(() => {
            console.log("connected to DB")
        }).catch((err) => {
            console.log("Error connecting to DB", err)
        })
}

module.exports = connectToDb