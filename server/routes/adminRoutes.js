// adminRoutes.js
import express from 'express';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import authenticateToken from '../middleware/authenticateToken.js';
import AdviserRequest from '../model/AdviserRequest.js';
import Research from '../model/Research.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../model/Admin.js';
import { io } from '../src/app.js'; // Import io instance

const adminRoutes = express.Router();

// Add state for tracking edit mode
let currentEditor = null;

adminRoutes.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Admin login attempt:', email);

        // Check for superadmin credentials 
        if (email === 'superadmin@buksu.edu.ph' && 
            password === 'BuksuSuperAdmin2024') {
            const token = jwt.sign(
                { 
                    role: 'superadmin',
                    email: email 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                token,
                role: 'superadmin',
                name: 'Super Administrator',
                message: 'Superadmin login successful'
            });
        }

        // Regular admin login
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, admin.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin._id,
                role: admin.role,
                email: admin.email,
                permissions: admin.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            role: admin.role,
            name: admin.name,
            permissions: admin.permissions,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

adminRoutes.post('/create-initial-admin', async (req, res) => {
    try {
        const adminExists = await Admin.findOne({ email: process.env.INITIAL_ADMIN_EMAIL });
        
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const admin = new Admin({
            name: 'Administrator',
            email: process.env.INITIAL_ADMIN_EMAIL,
            password: process.env.INITIAL_ADMIN_PASSWORD,
            uid: Date.now().toString(), // Generate a unique ID
            role: 'admin'
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Initial admin account created successfully'
        });

    } catch (error) {
        console.error('Error creating initial admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin account'
        });
    }
});

adminRoutes.get('/accounts/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

adminRoutes.get('/accounts/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

adminRoutes.get('/accounts/instructors', authenticateToken, async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Error fetching instructors' });
  }
});

adminRoutes.get('/accounts/instructors/:id', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ message: 'Error fetching instructor' });
  }
});

adminRoutes.put('/accounts/students/:id/archive', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error archiving student:', error);
    res.status(500).json({ message: 'Error archiving student' });
  }
});

adminRoutes.put('/accounts/instructors/:id/archive', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error archiving instructor:', error);
    res.status(500).json({ message: 'Error archiving instructor' });
  }
});

adminRoutes.put('/accounts/students/:id/restore', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error restoring student:', error);
    res.status(500).json({ message: 'Error restoring student' });
  }
});

adminRoutes.put('/accounts/instructors/:id/restore', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error restoring instructor:', error);
    res.status(500).json({ message: 'Error restoring instructor' });
  }
});

adminRoutes.get('/adviser-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await AdviserRequest.find()
      .sort({ createdAt: -1 });
    
    const totalInstructors = await Instructor.countDocuments();
    const totalAdvisers = await Instructor.countDocuments({ role: 'adviser' });
    const pendingRequests = await AdviserRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      requests,
      stats: {
        totalInstructors,
        totalAdvisers,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Error fetching adviser requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

adminRoutes.put('/adviser-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const request = await AdviserRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (status === 'approved') {
      // Find the instructor first
      const instructor = await Instructor.findById(request.instructor);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      // Update instructor role - Fix for role update
      if (typeof instructor.role === 'string') {
        // If role is a string, convert to array
        instructor.role = ['instructor', 'adviser'];
      } else if (Array.isArray(instructor.role)) {
        // If role is already an array, add 'adviser' if not present
        if (!instructor.role.includes('adviser')) {
          instructor.role.push('adviser');
        }
      }

      // Save instructor with new role
      await instructor.save();
      console.log('Updated instructor roles:', instructor.role); // Debug log

      // Update research with the new adviser
      const research = await Research.findByIdAndUpdate(
        request.research,
        { adviser: request.instructor },
        { new: true }
      );

      if (!research) {
        return res.status(404).json({ message: 'Research not found' });
      }

      // Reject other pending requests for this research
      await AdviserRequest.updateMany(
        { 
          research: request.research, 
          _id: { $ne: id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    // Update the request status
    request.status = status;
    await request.save();

    // Send success response with updated data
    res.status(200).json({ 
      message: `Request ${status} successfully`,
      request: await AdviserRequest.findById(id).populate('instructor')
    });

  } catch (error) {
    console.error('Error updating adviser request:', error);
    res.status(500).json({ 
      message: 'Error updating request',
      error: error.message 
    });
  }
});

adminRoutes.get('/user-counts', authenticateToken, async (req, res) => {
  try {
    const studentCount = await Student.countDocuments({ archived: false });
    const instructorCount = await Instructor.countDocuments({ 
      archived: false,
      role: 'instructor'
    });
    const adviserCount = await Instructor.countDocuments({
      archived: false,
      role: { $in: ['adviser'] }
    });

    res.status(200).json({
      students: studentCount,
      instructors: instructorCount,
      advisers: adviserCount
    });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    res.status(500).json({ message: 'Error fetching user counts' });
  }
});

// Add new endpoints for edit mode management
adminRoutes.post('/edit-mode', authenticateToken, async (req, res) => {
  try {
    const { isEditing, editor } = req.body;
    
    // If someone wants to enter edit mode but someone else is already editing
    if (isEditing && currentEditor && currentEditor !== editor) {
      return res.status(403).json({ 
        success: false,
        message: `Another admin (${currentEditor}) is currently editing` 
      });
    }

    // Update editor state
    if (isEditing) {
      currentEditor = editor;
    } else if (currentEditor === editor) {
      currentEditor = null;
    }

    // Broadcast the change through Socket.IO
    io.emit('editModeChange', { isEditing, editor });

    res.json({ 
      success: true, 
      currentEditor,
      message: isEditing ? 'Edit mode enabled' : 'Edit mode disabled'
    });
  } catch (error) {
    console.error('Error updating edit mode:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Add endpoint to check current editor
adminRoutes.get('/edit-mode', authenticateToken, async (req, res) => {
  res.json({ 
    success: true,
    currentEditor 
  });
});

export default adminRoutes;
