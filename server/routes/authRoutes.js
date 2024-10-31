import express from 'express';
import bcrypt from 'bcrypt'; // For hashing passwords
import jwt from 'jsonwebtoken'; // For JWT token generation
import User from '../model/user.js'; // Adjust the path as necessary
import '../src/firebaseAdminConfig.js'; // Import Firebase Admin config

const router = express.Router();

router.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
        return res.status(400).json({ error: 'Name, email, and UID are required' });
    }

    try {
        // Check if user already exists by UID
        let user = await User.findOne({ uid });

        // If user does not exist, create a new one
        if (!user) {
            // Determine user role based on email domain
            let role;
            if (email.endsWith('@student.buksu.edu.ph')) {
                role = 'student';
            } else if (email.endsWith('@gmail.com')) {
                role = 'instructor'; // Allow @gmail.com as instructor
            } else {
                return res.status(400).json({ message: 'Invalid email domain' });
            }

            // Create a new user if they don't exist
            user = new User({ name, email, uid, role });
            await user.save(); // Ensure the user is saved before generating a token
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        // Respond with success message, token, and user role
        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role // Return the user's role
        });
    } catch (error) {
        console.error('Error saving or verifying user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Email/Password Authentication Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate email format
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        // Respond with success message, token, and user role
        res.json({
            message: 'Login successful',
            token,
            role: user.role // Return the user's role
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Determine user role based on email domain
        let role;
        if (email.endsWith('@student.buksu.edu.ph')) {
            role = 'student';
        } else if (email.endsWith('@gmail.com')) {
            role = 'instructor';
        } else {
            return res.status(400).json({ message: 'Invalid email domain' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
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

// Export the router
export default router;
