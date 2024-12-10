// Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    photoURL: {  
        type: String,
        default: null
    },
    uid: { 
        type: String, 
        required: true, 
        unique: true 
    },
    course: {
        type: String,
        enum: ['BS-MATH', 'BS-ES', 'BSDC', 'BSCD', 'BS-BIO', 'AB-SOCSCI', 'AB-SOCIO', 'AB-PHILO'],
        required: false
    },
    role: { 
        type: String, 
        enum: ['student'], 
        required: true,
        default: 'student'
    },
    studentId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        index: true  // Add index for better performance
    },
    archived: { 
        type: Boolean, 
        default: false,
        index: true  // Add index for archived queries
    },
    section: { 
        type: String, 
        required: false,
        trim: true 
    },
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: false
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Research'
    }],
    projectMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student' // Reference to other students in the project
    }],
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor' // Reference to the instructor overseeing the project
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for getting student's research
studentSchema.virtual('research', {
    ref: 'Research',
    localField: '_id',
    foreignField: 'mongoId'
});

// Add method to get active research count
studentSchema.methods.getResearchCount = async function() {
    const Research = mongoose.model('Research');
    return await Research.countDocuments({ studentId: this.studentId });
};

const Student = mongoose.model('Student', studentSchema);

// Ensure indexes are created
Student.createIndexes();

export default Student;
