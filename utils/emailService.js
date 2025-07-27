// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// const sendOTPEmail = async (email, otp) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Your OTP for Verification",
//         text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log("OTP sent successfully");
//     } catch (error) {
//         console.error("Error sending OTP:", error);
//     }
// };

// module.exports = sendOTPEmail;

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp, subject, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `${message} Your OTP is: ${otp}. It is valid for 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};

module.exports = sendOTPEmail;
