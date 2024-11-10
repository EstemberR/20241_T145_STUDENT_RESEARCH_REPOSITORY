    // Admin.js
    import mongoose from 'mongoose';
    import User from './user.js'; 

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
            enum: ['admin'],
            default: 'admin' 
        }
    });

    const Admin = mongoose.model('Admin', adminSchema);
    export default Admin;
