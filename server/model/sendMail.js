import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "8124cd001@smtp-brevo.com",
        pass: "fcAdNrDObMXQ4Rjy"
    }
});

const sendOTPEmail = async (userEmail, otp) => {
    const mailOptions = {
        from: {
            name: "Student Research Repository",
            address: "2201101589@student.buksu.edu.ph"
        },
        to: userEmail,
        subject: "Your OTP Code for Verification",
        html: `
            <h1>OTP Verification</h1>
            <p>Dear User,</p>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>Please use this code to verify your email.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>Student Research Repository Team</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return "OTP email sent successfully";
    } catch (error) {
        console.error('Email Error:', error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

export { sendOTPEmail };