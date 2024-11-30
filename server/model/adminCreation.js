import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: ['manage_students', 'manage_instructors', 'manage_research', 'generate_reports']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdBy: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

// Add password hashing middleware if not already present
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;