const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  servie: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.USER,
    pass: process.env.MY_PASSWORD,
  },
});

const sendPrivacyPolicyEmail = async (userEmail) => {
  const mailOptions = {
    from: {
      name: "Your Company Name",
      address: process.env.USER,
    },
    to: userEmail,
    subject: "Welcome! Your Privacy Policy",
    text: "Welcome to our system! Please find our privacy policy attached.",
    html: "<h1>Welcome!</h1><p>Please find our <a href='link_to_privacy_policy'>Privacy Policy</a> attached.</p>",
  };

  const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Privacy policy email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
}
sendMail(transporter, mailOptions);

