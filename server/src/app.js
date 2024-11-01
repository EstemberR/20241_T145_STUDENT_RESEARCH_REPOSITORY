import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import './firebaseAdminConfig.js';
import authRoutes from '../routes/authRoutes.js'; 
import bodyParser from 'body-parser';
import User from '../model/user.js';

dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 8000; 

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
}));
app.use(express.json()); 
app.use(bodyParser.json());

app.locals.userModel = User;

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

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MONGODB');
});
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    connect(); 
    console.log(`Listening on PORT ${PORT}`);
});