const jwt = require('jsonwebtoken');

function studentauthMiddleWare(req, res, next) {
    // console.log("1")
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    // console.log("2")

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ success: false, message: "No token provided" })
    }

    const student_token = authHeader.split(" ")[1];
    // console.log("3")
    console.log(student_token)

    try {
        // console.log("4")
        const decode = jwt.verify(student_token, process.env.JWT_SECRET_KEY)
        // console.log(decode)
        // console.log("5")
        req.student_id = decode.id;

        return next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Session Expired. Please Login again" })
        }
        // console.log("6")
        
        return res.status(401).json({ success: false, message: "Invalid Token" })
    }

}

module.exports = { studentauthMiddleWare }