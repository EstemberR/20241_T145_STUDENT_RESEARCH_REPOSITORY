const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/email');

const adminController = {
  // Create new admin
  createAdmin: async (req, res) => {
    try {
      const { username, email, permissions } = req.body;
      
      // Check if super admin
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      const newAdmin = await User.create({
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        permissions,
        createdBy: req.user._id
      });

      // Send welcome email with credentials
      await sendWelcomeEmail(email, username, tempPassword);

      res.status(201).json({
        success: true,
        message: 'Admin created successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all admins
  getAllAdmins: async (req, res) => {
    try {
      const admins = await User.find({ role: 'admin' })
        .select('-password')
        .populate('createdBy', 'username');
      
      res.status(200).json({ admins });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
