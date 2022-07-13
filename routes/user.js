const express = require("express")
const router = express.Router()
const userModule = require("../module/user")
const auth = require("../auth")

router.post('/register',userModule.registerUser)
router.post('/login',userModule.loginUser)
router.get('/welcome',auth,userModule.welcome)
router.get('/theater',auth,userModule.getTheater)
router.get('/theater/:name',auth,userModule.getTheaterByName)
router.post('/book',auth,userModule.bookMovie)
router.get('/bookedShows',auth,userModule.getBookedMovies)
router.get('/bookedShows/:theater/:movie/:date',auth,userModule.getBookedMoviesD)
router.get('/movies',auth,userModule.getMovies)
router.get('/movies/:name',auth,userModule.getMoviesbyName)
router.get('/signout',userModule.signout)

module.exports = router