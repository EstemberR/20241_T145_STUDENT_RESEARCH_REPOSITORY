// Student.js
import mongoose from 'mongoose';
import User from './user.js'; // Import the base User schema

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student'], required: true } 
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
