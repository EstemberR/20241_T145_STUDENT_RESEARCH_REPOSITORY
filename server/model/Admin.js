    // Admin.js
    import mongoose from 'mongoose';
    import bcrypt from 'bcrypt';
    
    // Define available permissions
    export const ADMIN_PERMISSIONS = {
        MANAGE_STUDENTS: 'manage_students',
        MANAGE_INSTRUCTORS: 'manage_instructors',
        MANAGE_ADMINS: 'manage_admins',
        MANAGE_RESEARCH: 'manage_research',
        MANAGE_ADVISER_REQUESTS: 'manage_adviser_requests',
        VIEW_ANALYTICS: 'view_analytics'
    };

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
        role: { type: String, default: 'admin' },
        permissions: [{ 
            type: String,
            enum: Object.values(ADMIN_PERMISSIONS)
        }],
        uid: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    });

    adminSchema.pre('save', async function(next) {
        // Only hash password if it's a new document
        if (!this.isNew) return next();
        
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
