const express = require('express')
const router = express.Router();
const {addcourse , studentlogin , getcourses , deletecourse , editcourse} = require('../controller/StudentDashboardControllers')
const {studentauthMiddleWare} = require('../middlewares/studentauthmidlleware')

router.get('/getcourses' ,studentauthMiddleWare, getcourses)

router.post('/addcourse' ,studentauthMiddleWare,  addcourse)

router.post('/deletecourse' ,studentauthMiddleWare, deletecourse)

router.post('/editcourse' ,studentauthMiddleWare , editcourse)

router.post('/studentlogin' , studentlogin)


module.exports = router;