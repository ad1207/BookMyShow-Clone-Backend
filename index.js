const express = require("express")
const dotenv = require("dotenv")
const mongo = require("./database")
const adminRoute = require("./routes/admin") 
const userRoute = require("./routes/user")
const cors = require("cors")
const cookieParser = require('cookie-parser');





dotenv.config()
const app = express()
app.use(express.json())
mongo.connect()
app.use(cors())
app.use(cookieParser());

app.get("/",(req,res) => {
    res.status(200).send("Welcome To Ticket Booker")
})

app.use("/admin",adminRoute)
app.use("/user",userRoute)




app.listen(process.env.PORT || 5000);