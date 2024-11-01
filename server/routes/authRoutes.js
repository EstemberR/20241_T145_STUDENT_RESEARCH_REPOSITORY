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
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            role: user.role 
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// One-time admin creation script
const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const email = "admin@example.com";
        const plainPassword = "adminpassword";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const admin = new User({
            name: "Admin",
            email,
            password: hashedPassword,
            role: "admin",
            uid: "admin_uid" // Provide a placeholder or static uid for the admin
        });

        await admin.save();
        console.log("Admin user created");
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Call the createAdmin function to run only once at startup
createAdmin();

export default router;
