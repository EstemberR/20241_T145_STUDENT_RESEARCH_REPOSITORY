import express from 'express';
import passport from 'passport';
import { sendOTPEmail } from '../model/sendMail.js';
import { generateOTP } from '../Utils/otpGenerate.js';
import generateToken from '../utils/token.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';

dotenv.config();

const router = express.Router();

// In-memory store for OTPs with timestamp
const otpStore = new Map();
const determineUserRole = (email) => {
    // Special cases for specific gmail accounts that should be students
    const studentGmailAccounts = [
        'nezerazami@gmail.com',
        'undefeatable.idiot@gmail.com'
    ];

    // Special case for specific gmail account that should be an instructor
    const instructorGmailAccounts = [
        'midnight.rain32145@gmail.com',
        'nezercursor2@gmail.com'
    ];

    if (email.endsWith('@student.buksu.edu.ph') || studentGmailAccounts.includes(email.toLowerCase())) {
        return 'student';
    } else if (email.endsWith('@buksu.edu.ph') || instructorGmailAccounts.includes(email.toLowerCase())) {
        return 'instructor';
    }
    return null; // For any other email domains
};

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const userRole = determineUserRole(email);

    if (!email) {
        console.log('[ERROR] No email provided');
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!userRole) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email domain. Please use a valid email address.'
        });
    }

    console.log(`[INFO] Request to send OTP to: ${email}`);

    try {
        // Check if an OTP was recently sent (within last 60 seconds)
        const existingOTP = otpStore.get(email);
        if (existingOTP) {
            const timeDiff = Date.now() - existingOTP.timestamp;
            if (timeDiff < 60000) { // 60 seconds
                return res.status(429).json({
                    message: `Please wait ${Math.ceil((60000 - timeDiff)/1000)} seconds before requesting another OTP`
                });
            }
        }

        const Model = userRole === 'student' ? Student : Instructor;
        const user = await Model.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.archived) {
            return res.status(403).json({
                success: false,
                message: 'This account has been archived. Please contact an administrator.'
            });
        }

        const otp = generateOTP();
        otpStore.set(email, {
            otp: otp,
            timestamp: Date.now()
        });

        user.verificationToken = otp;
        await user.save();
        await sendOTPEmail(email, otp);
        
        console.log(`[INFO] OTP sent to: ${email} | OTP: ${otp}`);
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Error in sendOtp:', error);
        res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
    }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const userRole = determineUserRole(email);

    if (!userRole) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email domain. Please use a valid email address.'
        });
    }

    try {
        const Model = userRole === 'student' ? Student : Instructor;
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.archived) {
            return res.status(403).json({
                success: false,
                message: 'This account has been archived. Please contact an administrator.'
            });
        }

        const storedOTPData = otpStore.get(email);
        if (!storedOTPData) {
            console.log('No stored OTP found for:', email);
            return res.status(400).json({ 
                message: 'No OTP found or OTP expired. Please request a new one.' 
            });
        }

        if (Date.now() - storedOTPData.timestamp > 300000) {
            console.log('OTP expired for:', email);
            otpStore.delete(email);
            return res.status(400).json({ 
                message: 'OTP has expired. Please request a new one.' 
            });
        }

        if (storedOTPData.otp.toString() !== otp.toString()) {
            console.log('Invalid OTP attempt:', { 
                email, 
                providedOTP: otp, 
                storedOTP: storedOTPData.otp
            });
            return res.status(400).json({ 
                message: 'Invalid OTP. Please try again.' 
            });
        }

        otpStore.delete(email);
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        const token = generateToken(user);
        console.log('User verified successfully:', email);
        
        return res.status(200).json({
            token,
            role: user.role,
            name: user.name,
            photoURL: user.photoURL,
            message: 'Verification successful!',
            redirect: user.role === 'student' ? '/student/dashboard' : '/instructor/instructor_dashboard'
        });

    } catch (error) {
        console.error('Error in OTP verification:', error);
        return res.status(500).json({ 
            message: 'Error verifying OTP' 
        });
    }
});

// Google Auth callback route
router.post('/google', async (req, res) => {
    const { name, email, uid, photoURL } = req.body;
    const userRole = determineUserRole(email);
    
    if (!userRole) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email domain. Please use a valid email address.'
        });
    }

    try {
        const Model = userRole === 'student' ? Student : Instructor;
        let user = await Model.findOne({ email });

        if (user) {
            console.log('Existing user detected:', email);

            // Always update photoURL with the latest from Google
            if (photoURL) {
                console.log('Updating user photo URL:', photoURL);
                user.photoURL = photoURL;
                await user.save();
            }
            
            if (user.archived) {
                return res.status(403).json({
                    success: false,
                    message: 'This account has been archived. Please contact an administrator.'
                });
            }

            const token = generateToken(user);
            return res.status(200).json({
                isVerified: true,
                token,
                role: user.role,
                name: user.name,
                photoURL: user.photoURL,
                message: 'Welcome back!',
                redirect: user.role === 'student' ? '/student/dashboard' : '/instructor/instructor_dashboard'
            });
        }

        console.log('New user detected:', email);
        const otp = generateOTP();
        
        // Create new user based on role
        if (userRole === 'student') {
            const studentId = email.split('@')[0];
            user = new Student({
                name, email, uid, photoURL,
                role: 'student',
                studentId,
                isVerified: false,
                verificationToken: otp,
                archived: false
            });
        } else {
            user = new Instructor({
                name, email, uid, photoURL,
                role: 'instructor',
                isVerified: false,
                verificationToken: otp,
                archived: false
            });
        }

        otpStore.set(email, {
            otp: otp,
            timestamp: Date.now()
        });

        await sendOTPEmail(email, otp);
        await user.save();
        
        return res.status(200).json({
            isVerified: false,
            photoURL: user.photoURL,
            message: 'OTP sent to your email for verification'
        });
    } catch (error) {
        console.error('Error in Google authentication:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
