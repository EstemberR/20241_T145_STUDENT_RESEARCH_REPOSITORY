import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv, { configDotenv } from 'dotenv';
import './firebaseAdminConfig.js';
import authRoutes from './authRouts.js'; 
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import User from './model/user.js';

dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 8000; 

// Middleware
app.use(cors()); 
app.use(express.json()); // Enable JSON parsing for requests
app.use(bodyParser.json());

// Assign User model to app.locals
app.locals.userModel = User;

// Connect to MongoDB
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MONGODB');
    } catch (error) {
        console.error('Error connecting to MONGODB:', error);
    }
};

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MONGODB');
});


// Google Auth Route
app.post('/google', async (req, res) => {
    const { name, email, uid } = req.body;

    try {
        // Check if user already exists
        const User = req.app.locals.userModel; // Access userModel from app.locals
         const user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            User = new User({
                name,
                email,
                uid,
            });
            await user.save();
            return res.status(201).json({ message: 'User created', user });
        } else {
            // User already exists
            return res.status(200).json({ message: 'User already exists', user });
        }
    } catch (error) {
        console.error('Error in /api/auth/google:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    connect(); // Call connect to establish MongoDB connection
    console.log(`Listening on PORT ${PORT}`);
});
