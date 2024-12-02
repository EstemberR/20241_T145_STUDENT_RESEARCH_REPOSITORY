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
import ExcelJS from 'exceljs';
import PDFGenerator from '../services/pdfGeneration.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { ADMIN_PERMISSIONS } from '../model/Admin.js';

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
        console.log('Found admin:', admin);
        
        if (!admin) {
            console.log('No admin found with email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            console.log('Inactive admin attempted to login:', email);
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact the super administrator.'
            });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        
        if (!isValidPassword) {
            console.log('Invalid password for admin:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

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

// Create new admin account (Super Admin only)
adminRoutes.post('/create-admin', authenticateToken, async (req, res) => {
    try {
        // Verify if requester is super admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can create admin accounts'
            });
        }

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
        if (permissions && Array.isArray(permissions)) {
            const invalidPermissions = permissions.filter(
                p => !Object.values(ADMIN_PERMISSIONS).includes(p)
            );
            
            if (invalidPermissions.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid permissions: ${invalidPermissions.join(', ')}`
                });
            }
        }

        // Create new admin with permissions
        const newAdmin = new Admin({
            name,
            email,
            password,
            permissions: permissions || [], // Include permissions from request
            role: 'admin',
            uid: Date.now().toString()
        });

        // Save and let middleware handle hashing
        await newAdmin.save();

        console.log('Created new admin:', {
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role,
            permissions: newAdmin.permissions // Log permissions
        });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            admin: {
                name: newAdmin.name,
                email: newAdmin.email,
                permissions: newAdmin.permissions
            }
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin account',
            error: error.message
        });
    }
});

// Get all admin accounts (Super Admin only)
adminRoutes.get('/admins', authenticateToken, async (req, res) => {
    try {
        // Verify if requester is super admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can view admin accounts'
            });
        }

        const admins = await Admin.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            admins
        });

    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin accounts'
        });
    }
});

// Update admin status (activate/deactivate)
adminRoutes.put('/admins/:id/status', authenticateToken, async (req, res) => {
    try {
        // Verify if requester is super admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can modify admin accounts'
            });
        }

        const { id } = req.params;
        const { isActive } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            admin,
            message: `Admin account ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Error updating admin status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admin status'
        });
    }
});

// Get all researches (both active and archived)
adminRoutes.get('/all-researches', authenticateToken, async (req, res) => {
  try {
    const researches = await Research.find({ status: 'Accepted' })
      .select('title authors course uploadDate abstract keywords driveFileId archived')
      .sort({ uploadDate: -1 });

    res.json(researches);
  } catch (error) {
    console.error('Error fetching researches:', error);
    res.status(500).json({ message: 'Error fetching researches' });
  }
});

// Archive research
adminRoutes.put('/research/:id/archive', authenticateToken, async (req, res) => {
  try {
    const research = await Research.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    // Send back the updated research
    res.json(research);
  } catch (error) {
    console.error('Error archiving research:', error);
    res.status(500).json({ message: 'Error archiving research' });
  }
});

// Restore research
adminRoutes.put('/research/:id/restore', authenticateToken, async (req, res) => {
  try {
    const research = await Research.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    res.json(research);
  } catch (error) {
    console.error('Error restoring research:', error);
    res.status(500).json({ message: 'Error restoring research' });
  }
});

// Get all courses
adminRoutes.get('/courses', authenticateToken, async (req, res) => {
  try {
    // Get unique courses from Student model
    const courses = await Student.distinct('course');
    // Format courses into objects
    const formattedCourses = courses
      .filter(course => course) // Remove null/empty values
      .map(course => ({
        _id: course,
        name: course
      }));
    
    res.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Generate report
adminRoutes.get('/generate-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, course, type } = req.query;
    let query = { status: 'Accepted' };

    if (startDate && endDate) {
      query.uploadDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let result;
    switch (type) {
      case 'submissions':
        const researches = await Research.find(query)
          .populate({
            path: 'mongoId',
            model: 'Student',
            select: 'course name',
            match: course ? { course: course } : {}
          })
          .populate('adviser', 'name')
          .sort({ uploadDate: -1 });
        
        // Filter out results where student doesn't match course criteria
        result = researches.filter(r => r.mongoId);
        
        // Format the results
        result = result.map(r => ({
          title: r.title,
          authors: r.authors,
          course: r.mongoId?.course || 'N/A',
          status: r.status,
          uploadDate: r.uploadDate
        }));
        break;

      case 'status':
        result = await Research.aggregate([
          { $match: query },
          {
            $lookup: {
              from: 'students',
              localField: 'mongoId',
              foreignField: '_id',
              as: 'student'
            }
          },
          {
            $match: course ? { 'student.course': course } : {}
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              researches: { $push: { title: '$title', date: '$uploadDate' } }
            }
          }
        ]);
        break;

      case 'course':
        result = await Research.aggregate([
          { $match: query },
          {
            $lookup: {
              from: 'students',
              localField: 'mongoId',
              foreignField: '_id',
              as: 'student'
            }
          },
          { $unwind: '$student' },
          {
            $match: course ? { 'student.course': course } : {}
          },
          {
            $group: {
              _id: '$student.course',
              count: { $sum: 1 },
              researches: { $push: { title: '$title', date: '$uploadDate' } }
            }
          }
        ]);
        break;

      default:
        result = [];
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Download report
adminRoutes.get('/download-report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, course, format } = req.query;
    let query = { status: 'Accepted' };

    if (startDate && endDate) {
      query.uploadDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const researches = await Research.find(query)
      .populate({
        path: 'mongoId',
        model: 'Student',
        select: 'course name',
        match: course ? { course: course } : {}
      })
      .populate('adviser', 'name')
      .sort({ uploadDate: -1 });

    // Filter out results where student doesn't match course criteria
    const filteredResearches = researches.filter(r => r.mongoId);

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Research Report');

      worksheet.columns = [
        { header: 'Title', key: 'title', width: 40 },
        { header: 'Authors', key: 'authors', width: 30 },
        { header: 'Course', key: 'course', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Submission Date', key: 'uploadDate', width: 15 }
      ];

      filteredResearches.forEach(research => {
        worksheet.addRow({
          title: research.title,
          authors: Array.isArray(research.authors) ? research.authors.join(', ') : research.authors,
          course: research.mongoId?.course || 'N/A',
          status: research.status,
          uploadDate: new Date(research.uploadDate).toLocaleDateString()
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=research-report-${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      return res.end();
    } else if (format === 'pdf') {
      const pdfGenerator = new PDFGenerator();
      const doc = pdfGenerator.generateReport(filteredResearches, startDate, endDate, course);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=research-report-${new Date().toISOString().split('T')[0]}.pdf`);

      // Create a write stream
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        res.end(result);
      });

      // Finalize the PDF
      doc.end();
    } else {
      return res.status(400).json({ message: 'Invalid format specified' });
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'Error downloading report' });
  }
});

// Update admin permissions
adminRoutes.put('/admins/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      admin,
      message: 'Permissions updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions'
    });
  }
});

export default adminRoutes;
