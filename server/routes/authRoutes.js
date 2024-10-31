import express from 'express';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import User from '../model/user.js'; 
import '../src/firebaseAdminConfig.js'; 

const router = express.Router();

router.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
        return res.status(400).json({ error: 'Name, email, and UID are required' });
    }

    try {
        let user = await User.findOne({ uid });

        if (!user) {
            let role;
            if (email.endsWith('@student.buksu.edu.ph')) {
                role = 'student';
            } else if (email.endsWith('@gmail.com')) { //TEST EMAIL FORMAT ONLY
                role = 'instructor';
            } else {
                return res.status(400).json({ message: 'Invalid email domain' });
            }

            user = new User({ name, email, uid, role });
            await user.save(); 
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role
        });
    } catch (error) {
        console.error('Error saving or verifying user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            role: user.role 
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        let role;
        if (email.endsWith('@student.buksu.edu.ph')) {
            role = 'student';
        } else if (email.endsWith('@gmail.com')) {
            role = 'instructor';
        } else {
            return res.status(400).json({ message: 'Invalid email domain' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering user', error });
    }
});

export default router;
