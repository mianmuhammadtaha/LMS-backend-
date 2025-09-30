
const Teacher = require('../model/teacherModel.js')
const Student = require('../model/studentModel.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { sendEnrollmentEmail, simpleGeneratePassword } = require('../nodemailer/nodemailer.js')


async function get_students(req, res) {
    try {
        const teacher_id = req.teacher_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;

        const totalStudents = await Student.countDocuments({ teacher_id });

        const students = await Student
            .find({ teacher_id })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            students,
            totalPages: Math.ceil(totalStudents / limit),// number ko upar ki taraf roundof karta hai 4.4 hai tu ya us ko 5 kar da ga 
            currentPage: page,
            limit
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


async function signup_teacher(req, res) {
    try {
        const { firstname, lastname, email, password, confirm_password } = req.body;
        // console.log("hello1 ")
        const teacher_to_find = await Teacher.findOne({ email: email }) //ya aik object return karta hai jis ma document hota hai 
        // console.log(user_to_find)
        // const user_to_find = await User.find({email : email}) //ya aik array return karta hai agar koi match na mila tu
        // jis ki waja sa [] aik truthy value hai tu if(!user_to_find) wali condition hamesha false hi ho rahi thi 
        // kyon k har dafa us ko aik empty array hi mil rahi thi


        // if(user_to_find != []){
        if (!teacher_to_find) {
            // check confirm_password
            if (password !== confirm_password) {
                return res.status(400).json({ success: false, message: "Passwords do not match!" })
            }

            // hash password before saving
            const saltRounds = 10; // recommended
            const hashedPassword = await bcrypt.hash(password, saltRounds)

            const new_teacher = await Teacher.create({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                // confirm_password: hashedPassword
            })
            new_teacher.save();
            // console.log(new_teacher)
            return res.status(201).json({ success: true, message: "Signed Up Successfully!", data: new_teacher })
        }
        else {
            return res.status(400).json({ success: false, message: "Email is already taken!" })
        }
    }
    catch (err) {
        console.log("signup_teacher Controller Error ------", err.message)
        // return res.send("signup_user Controller Error ------", err.message)

    }
}

async function signin_teacher(req, res) {
    try {
        // console.log("1")
        const { email, password } = req.body;
        const teacher_to_find = await Teacher.findOne({ email: email })

        // console.log(teacher_to_find)
        if (!teacher_to_find) {
            return res.status(404).json({ success: false, message: "User not Found!" })
        }


        // compare plain password with hashed password

        const isMatch = await bcrypt.compare(password, teacher_to_find.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password is Incorrect!" })
        }


        const token = jwt.sign(
            { id: teacher_to_find.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES })
        console.log(token)

        return res.status(200).json({
            success: true,
            token,
            message: "Signed in Successfully!"
        })
    }
    catch (err) {
        console.log("signin_user Controller Error ------", err.message)
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function save_student_form(req, res) {
    try {
        const { name, email, course, date } = req.body;

        const isEnrolled = await Student.findOne({ email: email })
        if (!isEnrolled) {

            // console.log("1")
            // console.log("2")
            const password = simpleGeneratePassword(8)
            console.log(password)

            const saltRounds = 10;
            const studentpassword = await bcrypt.hash(password, saltRounds)
            const newstudent = await Student.create({
                name: name,
                email: email,
                course: course,
                date: date,
                password: studentpassword,
                teacher_id: req.teacher_id
            })
            // console.log("3")

            newstudent.save()

            await sendEnrollmentEmail(email, name, course, password)

            return res.status(201).json({
                success: true,
                message: "Student Enrolled Successfully",
                data: newstudent
            })
        }
        else{
            res.json({ success : false , message : "Student Already Enrolled"})
        }
    }
    catch (err) {
        console.log("save_student_form error!!!", err.message)
        res.json({ message: "Server Error" })
    }
}

async function deleteStudent(req, res) {
    const { email } = req.body;
    console.log("1")
    console.log(email)
    console.log("2")
    const deleted_student = await Student.findOneAndDelete({ email: email });
    // console.log(deleted_student)
    if (deleted_student) {
        return res.status(200).json({ success: true, message: "Student Deleted Successfully" })
    }
    else {
        return res.status(404).json({ success: false, message: "Student Not Found" })
    }

}

async function editstudent(req, res) {
    try {
        // console.log("EditStudent ------ 1")
        const { name, email, course, date } = req.body;
        // console.log("EditStudent ------ 2")

        const edit_student = await Student.updateOne(
            { email: email },
            { $set: { name: name, email: email, course: course, date: date } }
        )
        // console.log("EditStudent ------ 3")

        if (edit_student.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Student Not Found" })
        }

        // else if (edit_student.modifiedCount === 0){
        //     return res.send("No changes are made data Already same")
        // }
        else {
            return res.status(200).json({ success: true, message: "Student Edited Successfully" })
        }

    }
    catch (err) {
        console.log("Edit Student Error", err.message)
        return res.status(500).json({ success: false, message: "Server Error" });

    }

}


module.exports = { get_students, signup_teacher, signin_teacher, save_student_form, deleteStudent, editstudent }
