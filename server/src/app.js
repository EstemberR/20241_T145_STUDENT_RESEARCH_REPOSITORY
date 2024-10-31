import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import './firebaseAdminConfig.js';
import authRoutes from '../routes/authRoutes.js'; 
import bodyParser from 'body-parser';
import User from '../model/user.js';

dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 8000; 

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your React app
    credentials: true, // Allow credentials if needed
}));
app.use(express.json()); // Enable JSON parsing for requests
app.use(bodyParser.json());

// Assign User model to app.locals
app.locals.userModel = User;

// Connect to MongoDB
const connect = async () => {
    try {
        await mongoose.connect("mongodb+srv://user99:Falcon@cluster0.qpda5.mongodb.net/Student_RepoDB?retryWrites=true&w=majority&appName=Cluster0");
        console.log('Connected to MONGODB');
    } catch (error) {
        console.error('Error connecting to MONGODB:', error);
    }
};

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MONGODB');
});

// API Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    connect(); // Call connect to establish MongoDB connection
    console.log(`Listening on PORT ${PORT}`);
});
