import express from 'express';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import '../src/firebaseAdminConfig.js'; 
import Admin from '../model/Admin.js';
import Instructor from '../model/Instructor.js';
import Student from '../model/Student.js'
const router = express.Router();
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.MY_PASSWORD,
    },
  });
  // FUNCTION TO SEND PRIVACY POLICY EMAIL
  const sendPrivacyPolicyEmail = async (userEmail) => {
    const mailOptions = {
      from: {
        name: "Student Research Repository",
        address: process.env.USER,
      },
      to: userEmail,
      subject: "Welcome to the College of Arts and Sciences!",
      html: `
        <p>Dear ${userEmail},</p>
        <p>Welcome to the College of Arts and Sciences!</p>
        <p>We value your privacy and are committed to protecting your personal information. Below is our Privacy Policy:</p>
        <hr>
        <h2>Privacy Policy</h2>
        <p><strong>Effective Date:</strong> November 14, 2024</p>
        <ol>
          <li><strong>Introduction</strong><br>
            We value your privacy and are committed to protecting your personal information.
          </li>
          <li><strong>Information We Collect</strong><br>
            We collect personal information that you provide to us when you register, log in, or use our services.
          </li>
          <li><strong>How We Use Your Information</strong><br>
            We use your information to provide and improve our services, communicate with you, and comply with legal obligations.
          </li>
          <li><strong>Sharing Your Information</strong><br>
            We do not sell or rent your personal information to third parties.
          </li>
          <li><strong>Your Rights</strong><br>
            You have the right to access, correct, or delete your personal information.
          </li>
          <li><strong>Changes to This Policy</strong><br>
            We may update this privacy policy from time to time. We will notify you of any changes.
          </li>
          <li><strong>Contact Us</strong><br>
            If you have any questions about this privacy policy, please contact us at [Your Contact Information].
          </li>
        </ol>
        <hr>
        <p>Best regards,</p>
        <p>College of Arts and Sciences</p>
        <hr>
        <p>This is the official email from the Student Research Repository of the College of Arts and Sciences.<br>
        Please do not reply to this email.<br>
        © 2024 College of Arts and Sciences. All rights reserved.</p>
      `,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
      });
    }

router.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
        return res.status(400).json({ error: 'Name, email, and UID are required' });
    }

    try {
        // Check if the user already exists (student or instructor)
        let user = await Student.findOne({ uid }) || await Instructor.findOne({ uid });
        
        // If user exists and is archived, prevent login
        if (user && user.archived) {
            return res.status(403).json({ 
                message: 'Your account has been archived. Please contact the administrator.' 
            });
        }

        // If no existing user is found, create a new one
        if (!user) {
            let role;
            if (email.endsWith('@student.buksu.edu.ph')) {
                user = new Student({ 
                    name, 
                    email, 
                    uid, 
                    role: 'student',
                    archived: false  // explicitly set archived status
                });
                const studentId = email.slice(0, 10);
                user.studentId = studentId;
            } else if (email.endsWith('@gmail.com')) {
                user = new Instructor({ 
                    name, 
                    email, 
                    uid, 
                    role: 'instructor',
                    archived: false  // explicitly set archived status
                });
            } else {
                return res.status(400).json({ message: 'Invalid email domain' });
            }
            
            await sendPrivacyPolicyEmail(user.email);
            await user.save();
        }

        // Double-check archived status (in case it was set after user creation)
        if (user.archived) {
            return res.status(403).json({ 
                message: 'Your account has been archived. Please contact the administrator.' 
            });
        }

        // Generate a JWT token for the user
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                archived: user.archived  // Include archived status in token
            }, 
            'your_jwt_secret', 
            { expiresIn: '1h' }
        );

        // Respond with the token and user details
        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            user_id: user.id,
            archived: user.archived  // Include archived status in response
        });
    } catch (error) {
        console.error('Error saving or verifying user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Admin accounts cannot be archived, but including the field for consistency
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                archived: false 
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            role: user.role,
            archived: false
        });
    } catch (error) {
        console.error('Detailed error during admin login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// One-time admin creation script
const createAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const email = "admin@example.com";
        const plainPassword = "adminpassword";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = new Admin({
            name: "Admin",
            email,
            password: hashedPassword,
            role: "admin",
            uid: "admin_uid" 
        });

        await user.save();
        console.log("Admin user created");
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

createAdmin();

export default router;
