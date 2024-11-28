import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';

import './firebaseAdminConfig.js';

import authRoutes from '../routes/auth.js';
import studentRoutes from '../routes/studentRoutes.js'; 
import instructorRoutes from '../routes/instructorRoutes.js'; 
import adminRoutes from '../routes/adminRoutes.js';

import Admin from '../model/Admin.js';
import Instructor from '../model/Instructor.js';
import Student from '../model/Student.js'
import driveRoutes from '../routes/driveRoutes.js';
//SUPER ADMIN
import superAdminRoutes from '../routes/superAdminRoutes.js';

dotenv.config(); 
const app = express();
const server = createServer(app); // Create HTTP server

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Store current editor state
let currentEditor = null;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current editor state when client connects
  socket.emit('editModeState', { editor: currentEditor });

  socket.on('editModeChange', (data) => {
    if (data.isEditing) {
      currentEditor = data.editor;
    } else if (currentEditor === data.editor) {
      currentEditor = null;
    }
    // Broadcast the change to all clients
    io.emit('editModeChange', { isEditing: data.isEditing, editor: data.editor });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(express.json());
const PORT = process.env.PORT || 6000; 

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));    
app.use(bodyParser.json());

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

app.use('/api/superadmin', superAdminRoutes);

app.use('/student', studentRoutes);
//GOOGLE DRIVE
app.use('/api/auth/google-drive', driveRoutes);

app.use('/instructor', instructorRoutes);
app.use('/admin', adminRoutes);

//EMAIL VERIFICATION
app.use('/api/auth', authRoutes); // Use the email routes under the /api/email path

// Change app.listen to server.listen
server.listen(PORT, () => {
    connect(); 
    console.log(`Listening on PORT ${PORT}`);
    app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
          console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
        }
    });
});

export { io }; // Export io for use in routes
export default app;