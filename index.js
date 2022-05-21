const express = require("express")
const dotenv = require("dotenv")
const mongo = require("./database")
const adminRoute = require("./routes/admin") 
const userRoute = require("./routes/user")



dotenv.config()
const app = express()
app.use(express.json())
mongo.connect()

app.get("/",(req,res) => {
    res.status(200).send("Welcome To BookMyShow")
})

app.use("/admin",adminRoute)
app.use("/user",userRoute)




app.listen(5000);