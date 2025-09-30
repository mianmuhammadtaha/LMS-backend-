const mongoose = require('mongoose');

const teacherschema = mongoose.Schema({
    firstname: { 
        type: String,
        required : true , 
     },
    lastname: { 
        type: String,
        required : true ,         
     },
    email: { 
        type: String,
        required : true , 
        unique : true  
     },
    password: { 
        type: String,
        required : true , 
     },
    confirm_password: { 
        type: String
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

const Teacher = mongoose.model("Teacher" , teacherschema);

module.exports = Teacher


