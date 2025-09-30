const mongoose = require('mongoose');

const studentDashboardSchema = mongoose.Schema({
    course_title: {
        type: String,
        required: true
    },
    teacher_name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    credit_hours: {
        type: Number,
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const StDashboard = mongoose.model('student_dasboards', studentDashboardSchema);

module.exports = StDashboard;