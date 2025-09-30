const express = require("express");
const app = express();
const mongoose = require('mongoose')
const UserRoutes = require('./routes/UserRoutes.js')
const StudentDashboardRoutes = require('./routes/StudentDashboardRoutes.js')
const cors = require('cors')

require('dotenv').config();

app.use(cors())
app.use(express.json());




mongoose.connect(process.env.mongodb_url)
.then(()=>{
    console.log("MongoDB Connected (Databse_MongodbFolder)")
})
.catch((err)=>{
    console.log("MongoDB error ----" , err)
})

app.use('/users' , UserRoutes )

app.use('/students' , StudentDashboardRoutes)

const port = process.env.port || 4000;
app.listen(port , ()=>{
    console.log(`Server is Running on Port ${port}`)
})