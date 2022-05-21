const express = require("express")
const router = express.Router()
const adminModule = require("../module/admin")
const auth = require("../auth")

router.post('/register',adminModule.registerAdmin)
router.post('/login',adminModule.loginAdmin)
router.post('/create',auth,adminModule.createTheater)
router.put('/update',auth,adminModule.updateTheater)
router.get('/getTheater',auth,adminModule.getTheater)
router.get('/welcome',auth,adminModule.welcome)
router.get('/bookedShows',auth,adminModule.getBookedMovies)

module.exports = router