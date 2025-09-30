const e = require('express');
const StudentsDashboard = require('../model/studentDashboardModel')
const Student = require('../model/studentModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

// async function getcourses(req, res) {
//     try {
//         const s_id = req.student_id;

//         const {course_title , teacher_name , duration , credit_hours} = req.body;

//         const searchCourses = await StudentsDashboard.find({
//             $or : [
//                 {course_title : course_title},
//                 {teacher_name : teacher_name},
//                 {duration : duration} ,
//                 {credit_hours : credit_hours}
//             ]
//         })
//         console.log(searchCourses)


//         // const data = await StudentsDashboard.find({ student_id: s_id })
//         // if (data && data.length > 0) {
//         //     res.status(200).json({ success: true, message: "Courses Fetched Successfully", courses: data })
//         // }
//         // else {
//         //     res.status(404).json({ success: false, message: "No course Found" })

//         // }

//     }
//     catch (err) {
//         console.log("getcourse Controller error-----", err.message)
//         res.status(500).json({ success: false, message: "Server Error" })

//     }
// }


async function getcourses(req, res) {
    try {
        // console.log("1")
        const s_id = req.student_id; // logged-in student ID
        const { courseSearch, teacherSearch, durationSearch, creditSearch } = req.query;
        // console.log("2")

        let orConditions = [];

        if (courseSearch) {
            orConditions.push({ course_title: { $regex: courseSearch, $options: "i" } });
        }
        // console.log("3")

        if (teacherSearch) {
            orConditions.push({ teacher_name: { $regex: teacherSearch, $options: "i" } });
        }
        // console.log("4")

        if (durationSearch) {
            orConditions.push({ duration: { $regex: durationSearch, $options: "i" } });
        }
        // console.log("5")

        if (creditSearch) {
            const creditNum = Number(creditSearch);
            if (!isNaN(creditNum)) {
                orConditions.push({ credit_hours: creditNum });
            }
        }

        // if (creditSearch) {
        //     orConditions.push({ credit_hours: { $regex: creditSearch.toString(), $options: "i" } });
        // }
        // console.log("6")

        // Base query: student_id must match
        let query = { student_id: s_id };

        // console.log("7")
        // Agar search fields me kuch value hai → OR condition add karo
        if (orConditions.length > 0) {
            query.$and = [
                { student_id: s_id },
                { $or: orConditions }
            ];
        }

        const searchCourses = await StudentsDashboard.find(query);

        // console.log("searched Course -------", searchCourses);

        if (searchCourses.length > 0) {
            res.status(200).json({ success: true, courses: searchCourses });
        } else {
            res.status(404).json({ success: false, message: "No course found" });
        }

    } catch (err) {
        console.log("getcourse Controller error-----", err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


async function addcourse(req, res) {
    try {
        console.log("hello world")
        const { course_title, teacher_name, duration, credit_hours } = req.body
        console.log("1")
        const isenrolled = await StudentsDashboard.findOne({ student_id: req.student_id, course_title: course_title })
        console.log("2")

        console.log(isenrolled)

        if (isenrolled) {
            return res.status(400).json({ success: false, message: "Course already Enrolled" })
        }
        else {
            const new_course = await StudentsDashboard.create({
                course_title: course_title,
                teacher_name: teacher_name,
                duration: duration,
                credit_hours: credit_hours,
                student_id: req.student_id
            })
            new_course.save();
            return res.status(200).json({ success: true, message: "Course added Successfully" })
        }


    }
    catch (err) {
        console.log("Student addcourse Controller Error---", err.message)
        return res.status(500).json({ success: false, message: "Server Error." })
    }

}

async function studentlogin(req, res) {
    try {

        const { email, password } = req.body;
        const isstudent = await Student.findOne({ email: email });
        console.log(email)
        console.log(password)

        console.log(isstudent)
        if (!isstudent) {
            return res.status(400).json({ success: false, message: "User not Found." })
        }

        console.log(isstudent.password)

        const isMatch = await bcrypt.compare(password, isstudent.password)

        const token = jwt.sign(
            { id: isstudent.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES })

        if (isMatch) {
            console.log(isMatch)
            return res.status(200).json({ success: true, message: "Student Logged in Successfully", token: token })
        }
        return res.status(400).json({ success: false, message: "Password is Incorrect." })

    }
    catch (err) {
        console.log("Student Login Error-----", err.message)
        res.status(500).json({ success: false, message: "Server Error, Please Try Again." })
    }

}


async function deletecourse(req, res) {
    try {
        const s_id = req.student_id;
        const { course_title } = req.body;

        console.log("7")

        const result = await StudentsDashboard.deleteOne({ course_title: course_title, student_id: s_id });
        console.log("8")

        if (result.deletedCount === 0) {
            console.log("Course not found")

            return res.status(404).json({ success: false, message: "Course not found" });
        }
        console.log("Course Deleted Successfully")
        return res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (err) {
        console.log("Delete controller (Student Dashboard) error ---", err.message);
        return res.status(500).json({ success: false, message: "Server error, please try again later" });
    }
}

async function editcourse(req, res) {
    try {
        const s_id = req.student_id;
        const { course_title, teacher_name, duration, credit_hours } = req.body;

        const edit = await StudentsDashboard.updateOne(
            { student_id: s_id, course_title: course_title },
            { $set: { course_title: course_title, teacher_name: teacher_name, duration: duration, credit_hours: credit_hours } }
        )

        if (edit.matchedCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Course not found"
            });
        }
        if (edit.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: "No changes made (data already up-to-date)"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully"
        });

    }
    catch (err) {
        console.log("editCourse Student Dashboard Controller error ------", err.message)
    }
}

module.exports = { addcourse, studentlogin, getcourses, deletecourse, editcourse }