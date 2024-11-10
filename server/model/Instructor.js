// Instructor.js
import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    role: { type: String, enum: ['instructor'], required: true },
    archived: { type: Boolean, default: false }

});

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;
