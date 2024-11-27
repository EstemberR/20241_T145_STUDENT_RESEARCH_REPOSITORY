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

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const isStudentEmail = email.endsWith('@student.buksu.edu.ph');

    if (!email) {
        console.log('[ERROR] No email provided');
        return res.status(400).json({ message: 'Email is required' });
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

        const Model = isStudentEmail ? Student : Instructor;
        
        // Find user and update their verification token
        const user = await Model.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        
        // Store OTP in memory
        otpStore.set(email, {
            otp: otp,
            timestamp: Date.now()
        });

        // Update user's verification token
        user.verificationToken = otp;
        await user.save();

        // Send OTP email
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
    const isStudentEmail = email.endsWith('@student.buksu.edu.ph');

    try {
        // Check stored OTP
        const storedOTPData = otpStore.get(email);
        if (!storedOTPData) {
            console.log('No stored OTP found for:', email);
            return res.status(400).json({ 
                message: 'No OTP found or OTP expired. Please request a new one.' 
            });
        }

        // Check if OTP is expired (5 minutes)
        if (Date.now() - storedOTPData.timestamp > 300000) {
            console.log('OTP expired for:', email);
            otpStore.delete(email);
            return res.status(400).json({ 
                message: 'OTP has expired. Please request a new one.' 
            });
        }

        // Verify OTP matches
        if (storedOTPData.otp.toString() !== otp.toString()) {
            console.log('Invalid OTP attempt:', { 
                email, 
                providedOTP: otp, 
                storedOTP: storedOTPData.otp,
                providedOTPType: typeof otp,
                storedOTPType: typeof storedOTPData.otp
            });
            return res.status(400).json({ 
                message: 'Invalid OTP. Please try again.' 
            });
        }

        const Model = isStudentEmail ? Student : Instructor;
        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear OTP from memory
        otpStore.delete(email);

        // Update user verification status
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        // Generate JWT token
        const token = generateToken(user);

        console.log('User verified successfully:', email);
        
        return res.status(200).json({
            token,
            role: user.role,
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
    const isStudentEmail = email.endsWith('@student.buksu.edu.ph');
    
    try {
        // Check if user exists in the appropriate collection
        const Model = isStudentEmail ? Student : Instructor;
        let user = await Model.findOne({ email });

        // If user exists (not a new user), directly authenticate
        if (user) {
            console.log('Existing user detected:', email);
            const token = generateToken(user);
            
            return res.status(200).json({
                isVerified: true,
                token,
                role: user.role,
                name: user.name,
                message: 'Welcome back!',
                redirect: user.role === 'student' ? '/student/dashboard' : '/instructor/instructor_dashboard'
            });
        }

        // Only for new users
        console.log('New user detected:', email);
        
        // Generate OTP first
        const otp = generateOTP();
        
        // Send OTP before creating user
        await sendOTPEmail(email, otp);
        console.log(`OTP sent successfully to new ${isStudentEmail ? 'student' : 'instructor'}:`, email);

            // Create new user
            if (isStudentEmail) {
                const studentId = email.split('@')[0];
                user = new Student({
                    name: name,
                    email: email,
                    uid: uid,
                    role: 'student',
                    studentId: studentId,
                    isVerified: false,
                    verificationToken: otp
                });
            } else {
                user = new Instructor({
                    name: name,
                    email: email,
                    uid: uid,
                    role: 'instructor',
                    isVerified: false,
                    verificationToken: otp
                });
            }

            // Store OTP in memory
            otpStore.set(email, {
                otp: otp,
                timestamp: Date.now()
            });

        try {
            await sendOTPEmail(email, otp);
            await user.save();
            console.log(`OTP sent successfully to ${isStudentEmail ? 'student' : 'instructor'}:`, email);
            
            return res.status(200).json({
                isVerified: false,
                message: 'OTP sent to your email for verification'
            });
        } catch (error) {
            console.error('Failed to complete registration:', error);
            return res.status(500).json({
                error: 'Failed to complete registration process'
            });
        }
    } catch (error) {
        console.error('Error in Google authentication:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
