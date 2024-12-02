    // Admin.js
    import mongoose from 'mongoose';
    import bcrypt from 'bcrypt';
    
    export const ADMIN_PERMISSIONS = {
        MANAGE_ACCOUNTS: 'manage_accounts',         // For managing student/instructor accounts
        MANAGE_REPOSITORY: 'manage_repository',     // For managing research submissions
        VIEW_USER_ACTIVITY: 'view_user_activity',   // For viewing user activities
        GENERATE_REPORTS: 'generate_reports'        // For generating system reports
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
            enum: Object.values(ADMIN_PERMISSIONS),
            validate: {
                validator: function(permission) {
                    return Object.values(ADMIN_PERMISSIONS).includes(permission);
                },
                message: props => `${props.value} is not a valid permission`
            }
        }],
        uid: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        createdAt: { type: Date, default: Date.now }
    });

    // Password hashing middleware
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

    adminSchema.methods.hasPermission = function(permission) {
        return this.permissions.includes(permission);
    };

    adminSchema.methods.hasAnyPermission = function(permissions) {
        return this.permissions.some(p => permissions.includes(p));
    };

    adminSchema.methods.hasAllPermissions = function(permissions) {
        return permissions.every(p => this.permissions.includes(p));
    };

    const Admin = mongoose.model('Admin', adminSchema);

    export const PERMISSION_DESCRIPTIONS = {
        [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS]: 'Can view and manage student/instructor accounts',
        [ADMIN_PERMISSIONS.MANAGE_REPOSITORY]: 'Can manage research submissions and repository content',
        [ADMIN_PERMISSIONS.VIEW_USER_ACTIVITY]: 'Can access and monitor user activities',
        [ADMIN_PERMISSIONS.GENERATE_REPORTS]: 'Can generate and view system reports'
    };

    export default Admin;
