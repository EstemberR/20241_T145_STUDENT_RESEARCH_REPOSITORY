import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import './firebaseAdminConfig.js';
import authRoutes from './authRouts.js'; 
import express from 'express'
import bodyParser from 'body-parser';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 8000; 

// Middleware
app.use(cors()); 
app.use(express.json()); // Enable JSON parsing for requests
app.use(bodyParser.json());

// Connect to MongoDB
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
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
