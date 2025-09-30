const express = require('express');
const router = express.Router()
const { get_students, signup_teacher, signin_teacher, save_student_form, deleteStudent, editstudent } = require('../controller/UserController.js')
const { authMiddleWare } = require('../middlewares/authMiddleWare.js')

router.get('/get_students', authMiddleWare, get_students)

router.post('/signup', signup_teacher)

router.post('/signin', signin_teacher)

// router.delete('/delete', delete_teacher)

router.post('/addstudents', authMiddleWare, save_student_form)

router.post('/deletestudent',authMiddleWare, deleteStudent)

router.patch('/editstudent' ,authMiddleWare, editstudent)

module.exports = router
