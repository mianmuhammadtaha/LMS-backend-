const nodemailer = require('nodemailer')

// simpleGeneratePassword.js
function simpleGeneratePassword(length = 8) {
  if (length < 6) length = 6; // minimum safe length

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()-_=+[]{};:,.<>?';

  // pick one from each required set
  const req = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // fill the rest from all characters
  const all = lower + upper + numbers + special;
  const restLen = Math.max(length - req.length, 0);
  const rest = Array.from({ length: restLen }, () => all[Math.floor(Math.random() * all.length)]);

  // merge and shuffle
  const pwdArray = [...req, ...rest];
  for (let i = pwdArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwdArray[i], pwdArray[j]] = [pwdArray[j], pwdArray[i]];
  }

  return pwdArray.join('');
}

// Transporter create karo
const transporter = nodemailer.createTransport({
  service: "gmail",   // agar Gmail use karna ho
  auth: {
    user: "muhammadtahamian23@gmail.com",  // apna Gmail
    pass: "uftj pstn bddg yfkg",           // Gmail App Password (normal password nahi chalega)
  },
});

// Function jo email bheje

async function sendEnrollmentEmail(to, studentName, courseName , password) {
  try {
    // const password = simpleGeneratePassword(8)
    await transporter.sendMail({
      from: '"MT Teach" <muhammadtahamian23@gmail.com>',
      to: to,
      subject: "Enrollment Successful 🎉",
      html: `
        <h2>Hi ${studentName},</h2>
        <p>Congratulations! You are successfully enrolled in the course: <b>${courseName}</b>.</p>
        <p>We are excited to have you onboard.</p>
        <>Your Password is ${password} </>
      `,
    });
    console.log(" Email sent successfully");
  } catch (err) {
    console.error(" Email error:", err);
  }
};

module.exports = { sendEnrollmentEmail , simpleGeneratePassword };