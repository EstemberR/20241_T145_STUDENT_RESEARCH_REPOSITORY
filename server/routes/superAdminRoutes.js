import express from 'express';
import { SuperAdmin } from '../model/SuperAdmin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/admin-login', async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        // Verify recaptcha token
        if (!recaptchaToken) {
            return res.status(400).json({ message: 'Please complete the reCAPTCHA' });
        }

        // Find super admin
        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: superAdmin._id,
                role: 'superadmin',
                email: superAdmin.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            name: superAdmin.name,
            role: 'superadmin'
        });

    } catch (error) {
        console.error('Super Admin login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

export default router; 