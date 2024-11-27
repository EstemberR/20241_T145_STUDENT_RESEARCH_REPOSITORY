import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Super Admin credentials
const superAdminData = {
    email: 'superadmin@buksu.edu.ph',  
    password: 'BuksuSuperAdmin2024',    
    name: 'Super Administrator',
    role: 'superadmin'
};


const superAdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'superadmin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

superAdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
export default SuperAdmin; 