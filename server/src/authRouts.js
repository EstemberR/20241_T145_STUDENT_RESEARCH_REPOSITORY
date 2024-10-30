import express from 'express';
import './firebaseAdminConfig.js';
import User from './model/user.js';

const router = express.Router();

router.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;// Get the token from the request body

     // Basic validation
     if (!name || !email || !uid) {
        return res.status(400).json({ error: 'Name, email, and UID are required' });
    }
    try {
         // Check if the user already exists
         let user = await User.findOne({ uid });
         if (!user ) {
             // If user does not exist, create a new user in MongoDB
             user = new User({ name, email, uid });
             await user.save();
         }
 
         res.status(200).json({ message: 'Login successful', userId: user._id });
     } catch (error) {
         console.error('Error saving or verifying user:', error);
         res.status(500).json({ error: 'Internal server error' });
     }
});

export default router;
