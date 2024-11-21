    // Admin.js
    import mongoose from 'mongoose';
    import bcrypt from 'bcrypt';
    
    // Super Admin credentials
const superAdminData = {
    email: 'superadmin@buksu.edu.ph',  
    password: 'BuksuSuperAdmin2024',    
    name: 'Super Administrator',
    role: 'superadmin'
};

    const adminSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },  
        uid: { type: String, required: true, unique: true },
        permissions: { 
            type: [String],
            default: ['manage_users', 'view_reports', 'edit_content']
        },
        createdAt: { type: Date, default: Date.now },
        lastLogin: { type: Date },
        profilePicture: { type: String },
        role: { 
            type: String, 
            enum: ['admin', 'superadmin'],
            default: 'admin' 
        }
    });

    adminSchema.pre('save', async function(next) {
        if (!this.isModified('password')) return next();
        
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    });

    const Admin = mongoose.model('Admin', adminSchema);
    export default Admin;
