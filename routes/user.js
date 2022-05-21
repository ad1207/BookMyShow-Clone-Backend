const express = require("express")
const router = express.Router()
const userModule = require("../module/user")
const auth = require("../auth")

router.post('/register',userModule.registerUser)
router.post('/login',userModule.loginUser)
router.get('/welcome',auth,userModule.welcome)
router.get('/movies',auth,userModule.getMovies)
router.post('/book',auth,userModule.bookMovie)
router.get('/bookedShows',auth,userModule.getBookedMovies)


module.exports = router