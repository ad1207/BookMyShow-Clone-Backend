const mongo = require("../database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports.registerUser = async (req,res,next) => {
    try{
        const {firstName, lastName, email, password} = req.body;

        if(!(email && password && firstName && lastName)){
            res.status(400).send("All input is required")
        }

        const oldUser = await mongo.selectedDb.collection("userList").find({email:email}).toArray()
        
        if(oldUser.length>0){
            console.log(oldUser)
            return res.status(409).send("User already exist! Please login")
        }

        let encryptedPassword = await bcrypt.hash(password,10)

        let user = {first_name:firstName, last_name:lastName, email: email.toLowerCase(), password:encryptedPassword}

        let data = await mongo.selectedDb.collection("userList").insertOne(user)

        let newUser = await mongo.selectedDb.collection("userList").find({email:email}).toArray()
        newUser = newUser[0]
        const token = jwt.sign(
            {user_id:email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "1h",
            }
        )

        console.log(newUser)

        user = {
            _id:newUser._id,
            first_name:newUser.first_name,
            last_name:newUser.last_name,
            email:newUser.email,
            password:newUser.password,
            token:token
        }
        res.cookie("token",token,{maxAge:3600000, sameSite: 'none'})

        res.status(201).send(user)


    }catch(err){
        console.log(err)
    }
}

module.exports.loginUser = async (req,res,next) => {
    try{
        const {email,password} =req.body;
        if(!(email && password)){
            res.status(400).send("All inputs are required")
        }

        let user = await mongo.selectedDb.collection("userList").find({email:email}).toArray()
        user = user[0]
        if(user && (await bcrypt.compare(password,user.password))){
            const token = jwt.sign(
                {user_id:email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "1h"
                }
            )

            user = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                token: token
            }
            res.cookie("token",token,{maxAge:3600000, sameSite: 'none'})

            return res.status(200).send(user)
        }
        return res.status(400).send("Invalid Credintials")
    }catch(err){
        console.log(err)
    }
}

module.exports.welcome = async (req,res,next) => {
    try{
        res.send("Welcome User")
    }catch(err){
        console.log(err)
    }
}

module.exports.bookMovie = async (req,res,next) => {
    try{
        let list = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        let {name,date,movie,seatNumbers} = req.body;
        let avail = true
        for(let i=0;i<list.length;i++){
            if(list[i].name == name){
                avail = true
                break
            }
        }
        let bookedlist = await mongo.selectedDb.collection('bookedShows').find().toArray()
        let availableseat = true
        let theaterinserted = false
        let seats;
        if(avail){
            for(let i=0;i<bookedlist.length;i++){
                if((bookedlist[i].name==name)&&(bookedlist[i].date==date)&&(bookedlist[i].movie==movie)){
                    theaterinserted = true
                    seats = bookedlist[i].seatNumbers;
                    for(let x=0;x<seats.length;x++){
                        for(let y=0;y<seatNumbers.length;y++){
                            if(seats[x]===seatNumbers[y]){
                                availableseat = false
                                break;
                            }
                        }
                    }
                }
            }
            if(theaterinserted){
                if(availableseat){
                    let finalseats = seats.concat(seatNumbers)
                    let data = await mongo.selectedDb.collection('bookedShows').findOneAndUpdate({name:req.body.name,date:req.body.date,movie:req.body.movie},{$set:{seatNumbers:finalseats}})
                    res.send(data)
                }
                else{
                    res.send("Seat Not available")
                }
            }else{
                let data = await mongo.selectedDb.collection('bookedShows').insertOne(req.body)
                res.send(data)
            }    
        }
        else{
            res.send('Theater not available')
        }
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getTheater = async (req,res,next) => {
    try{
        let list = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        res.send(list)
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getTheaterByName = async (req,res,next) => {
    try{
        let list = await mongo.selectedDb.collection('theaterDetails').find({name:req.params.name}).toArray()
        let arr = []
        let movies = []
        let val = list[0].movieRunning
        for(let i=0;i<4;i++){
            if(movies.includes(val[i])){
                for(let j=0;j<arr.length;j++){
                    if(arr[j].name==val[i]){
                        let obj = arr[j].showlist
                        obj.push(i)
                        arr[j].showlist = obj
                    }
                }
            }
            else{
                let obj = {
                    name:val[i],
                    showlist:[i]
                }
                movies.push(val[i])
                arr.push(obj)
            }
        }
        res.send(arr)
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getBookedMovies = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('bookedShows').find().toArray()
        res.send(data)
    }catch(err){
        console.log(err)
        res.send(err)
    }
}

module.exports.getBookedMoviesD = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('bookedShows').find({name:req.params.theater,movie:parseInt(req.params.movie),date:req.params.date}).toArray()
        
        res.send(data)
    }
    catch(err){
        res.send(err)
    }
}
module.exports.getMovies = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        let movies = []
        let final = []
        for(let i=0;i<data.length;i++){
            var resu = data[i].movieRunning
            for(let j=0;j<4;j++){
                if(movies.includes(resu[j])==false && resu[j]!=""){
                    var obj={
                        name:resu[j],
                        showlist:[{name:data[i].name,show:[j]}]
                    }
                    final.push(obj)
                    movies.push(resu[j])
                }
                else if(movies.includes(resu[j])){
                    for(let x=0;x<final.length;x++){
                        if(final[x].name==resu[j]){
                            flag=false
                            let showlis = final[x].showlist
                            for(let k=0;k<showlis.length;k++){
                                if(showlis[k].name===data[i].name){
                                    let tempshow = showlis[k].show;
                                    tempshow.push(j);
                                    flag=true
                                }
                            }
                            if(flag==false){
                                final[x].showlist.push({name:data[i].name,shoe:[j]})
                            }
                        }
                    }
                }   
            }
        }
        res.send(final)
    }
    catch(err){
        res.send(err)
    }
}

module.exports.getMoviesbyName = async (req,res,next) => {
    try{
        let data = await mongo.selectedDb.collection('theaterDetails').find().toArray()
        let final = []
        for(let i=0;i<data.length;i++){
            var resu = data[i].movieRunning
            for(let j=0;j<4;j++){
                if(resu[j]==req.params.name){
                    let flag=false
                    for(let k=0;k<final.length;k++){
                        if(final[k].name==data[i].name){
                            let tempshow = final[k].show;
                            tempshow.push(j)
                            flag=true
                        }
                    }
                    if(flag===false){
                        final.push({name:data[i].name,show:[j]})
                    } 
                }  
            }
        }
        if(final.length>0){
            res.send(final)
        }
        else{
            res.send("Shows currently unavailable")
        }
    }
    catch(err){
        res.send(err)
    }
}

module.exports.signout = async (req,res,next) =>{
    try{
        res.clearCookie('token')
        res.send("Cookie removed")
    }catch(err){
        res.send(err)
    }
}