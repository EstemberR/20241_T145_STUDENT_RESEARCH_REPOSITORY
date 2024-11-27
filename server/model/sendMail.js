import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  
    port: 587,             
    secure: false,         
    auth: {
        user: process.env.USER,
        pass: process.env.MY_PASSWORD,  // Use App Password if 2FA is enabled
    },
    tls: {
        rejectUnauthorized: false  // Accept self-signed certificates
    },
    debug: true,           
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to take our messages");
    }
});

const sendOTPEmail = async (userEmail, otp) => {
    const mailOptions = {
        from: {
            name: "Student Research Repository",
            address: process.env.USER,
        },
        to: userEmail,
        subject: "Your OTP Code for Verification",
        text: `Your OTP code is: ${otp}. Please use this code to verify your email.`,
        html: `
            <h1>OTP Verification</h1>
            <p>Dear User,</p>
            <p>Your OTP code is: <strong>${otp}</strong>. Please use this code to verify your email.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>The Student Research Repository Team</p>
        `,
    };

    try {
        console.log(`[INFO] Attempting to send OTP to: ${userEmail}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SUCCESS] Email sent to ${userEmail} | Message ID: ${info.messageId}`);
        return "OTP email sent successfully";
    } catch (error) {
        console.error(`[ERROR] Failed to send OTP to ${userEmail} | Error:`, error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

export { sendOTPEmail };