// Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true, unique: true },
    course: {
        type: String,
        enum: ['BS-MATH', 'BS-ES', 'BSDC', 'BSCD', 'BS-BIO', 'AB-SOCSCI', 'AB-SOCIO', 'AB-PHILO'],
        required: false
    },
    role: { type: String, enum: ['student'], required: true },
    studentId: { type: String, required: true, unique: true },
    archived: { type: Boolean, default: false },
    section: { type: String, required: false }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
