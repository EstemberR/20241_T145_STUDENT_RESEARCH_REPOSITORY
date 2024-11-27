import express from 'express';
import SuperAdmin from '../model/SuperAdmin.js';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import Research from '../model/Research.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateToken from '../utils/token.js';
import mongoose from 'mongoose';

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

export default router; 