// Instructor.js
import mongoose from 'mongoose';
import User from './user.js';

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    role: { type: String, enum: ['instructor'], required: true }
});

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;
