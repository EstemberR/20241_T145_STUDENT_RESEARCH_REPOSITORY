// Instructor.js
import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { 
        type: String,
        default: null
    },
    uid: { type: String, required: true, unique: true },
    role: {
        type: [String],
        default: ['instructor'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Role must be a non-empty array'
        }
    },
    archived: { type: Boolean, default: false }

});

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;
