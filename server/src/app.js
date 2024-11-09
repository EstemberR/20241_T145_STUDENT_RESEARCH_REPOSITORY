import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import './firebaseAdminConfig.js';

import authRoutes from '../routes/authRoutes.js'; 
import studentRoutes from '../routes/studentRoutes.js'; 
import instructorRoutes from '../routes/instructorRoutes.js'; 

import User from '../model/user.js';
import Admin from '../model/Admin.js';
import Instructor from '../model/Instructor.js';
import Student from '../model/Student.js'

dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 8000; 

app.use(cors({
    origin: 'http://localhost:3000', 
    method: "POST",
    credentials: true,
}));    
app.use(express.json()); 
app.use(bodyParser.json());

app.locals.userModel = User;
app.locals.userModel = Admin;
app.locals.userModel = Instructor;
app.locals.userModel = Student;

const connect = async () => {
    try {
        await mongoose.connect("mongodb+srv://user99:cMYlXBtV3YfXWtAe@cluster0.qpda5.mongodb.net/Student_RepoDB?retryWrites=true&w=majority&appName=Cluster0", {
        });
        console.log('Connected to MONGODB');
    } catch (error) {
        console.error('Error connecting to MONGODB:', error);
    }
};

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MONGODB');
});
//google auth
app.use('/api/auth', authRoutes);
//manual login
app.use('/api', authRoutes);

app.use('/student', studentRoutes);

app.use('/instructor', instructorRoutes);



app.listen(PORT, () => {
    connect(); 
    console.log(`Listening on PORT ${PORT}`);
});