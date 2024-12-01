import express from 'express';
import SuperAdmin from '../model/SuperAdmin.js';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import Research from '../model/Research.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateToken from '../utils/token.js';
import mongoose from 'mongoose';
import Admin from '../model/Admin.js';
import { ADMIN_PERMISSIONS } from '../model/Admin.js';

const router = express.Router();
  
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        // Verify recaptcha token
        if (!recaptchaToken) {
            return res.status(400).json({ message: 'Please complete the reCAPTCHA' });
        }

        // Find admin in both SuperAdmin and Admin collections
        const admin = await Admin.findOne({ email }) || await SuperAdmin.findOne({ email });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: admin._id,
                role: admin.role,
                email: admin.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            name: admin.name,
            role: admin.role
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// And replace them with these updated routes
router.get('/instructors', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching instructors... Auth user:', req.user);
    
    // Check if database is connected
    if (!mongoose.connection.readyState) {
      throw new Error('Database not connected');
    }
    
    const instructors = await Instructor.find({ archived: false })
      .select('name email department isAdmin')
      .sort({ name: 1 });
    
    console.log('Raw instructors data:', instructors);
    console.log('Found instructors:', instructors.length);
    
    const stats = {
      total: instructors.length,
      admins: instructors.filter(i => i.isAdmin).length,
      regular: instructors.filter(i => !i.isAdmin).length
    };

    console.log('Stats:', stats);

    res.status(200).json({
      success: true,
      instructors,
      stats
    });
  } catch (error) {
    console.error('Error in /instructors route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching instructors',
      error: error.message 
    });
  }
});

// Update instructor admin status
router.put('/instructors/:instructorId/admin-status', authenticateToken, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { isAdmin } = req.body;

    console.log(`Updating instructor ${instructorId} admin status to ${isAdmin}`);

    const instructor = await Instructor.findByIdAndUpdate(
      instructorId,
      { isAdmin },
      { new: true }
    ).select('name email department isAdmin');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Updated instructor:', instructor);

    res.status(200).json({
      success: true,
      message: `Instructor admin status updated successfully`,
      instructor
    });
  } catch (error) {
    console.error('Error updating instructor admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating instructor admin status',
      error: error.message
    });
  }
});

router.post('/create-admin', authenticateToken, async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Validate permissions
        if (permissions) {
            const validPermissions = Object.values(ADMIN_PERMISSIONS);
            const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
            if (invalidPermissions.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid permissions: ${invalidPermissions.join(', ')}`
                });
            }
        }

        // Create new admin with raw password
        const admin = new Admin({
            name,
            email,
            password,  // Raw password - will be hashed by middleware
            role: 'admin',
            permissions: permissions || [],
            uid: Date.now().toString()
        });

        await admin.save();

        console.log('Created new admin:', {
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin'
        });
    }
});

export default router; 