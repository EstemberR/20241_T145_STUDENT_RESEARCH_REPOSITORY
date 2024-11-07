import express from 'express';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import User from '../model/user.js'; 
import '../src/firebaseAdminConfig.js'; 
import Admin from '../model/Admin.js';
import Instructor from '../model/Instructor.js';
import Student from '../model/Student.js'
const router = express.Router();

router.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
        return res.status(400).json({ error: 'Name, email, and UID are required' });
    }
    try {
        //FIND THE EXISTING USERS LIKE STUDENTS AND INSTRUCTOR
        let user = await Student.findOne({ uid }) || await Instructor.findOne({ uid });

        if (!user) {
            let role;
            if (email.endsWith('@student.buksu.edu.ph')) {
                user = new Student({ name, email, uid, role: 'student' });
            } else if (email.endsWith('@gmail.com')) { //TEST EMAIL FORMAT ONLY
                user = new Instructor({ name, email, uid, role: 'instructor' });
            } else {
                return res.status(400).json({ message: 'Invalid email domain' });
            }
            await user.save();
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role,
            name: user.name,
            email: user.email
            

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

        // Check if the user is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        //CHEKING THE CREDETIALS
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        //DEBUGGER
        console.log("Password match result:", isMatch);

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
        console.error('Detailed error during admin login:', error); //DEBUGGER
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
