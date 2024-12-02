import { ADMIN_PERMISSIONS } from '../model/Admin.js';

export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Assuming the user object is attached to req by your auth middleware
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ 
                success: false, 
                message: 'No permission information available' 
            });
        }

        if (!req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
};

// For checking multiple permissions (ANY of the permissions)
export const checkAnyPermission = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ 
                success: false, 
                message: 'No permission information available' 
            });
        }

        const hasPermission = req.user.permissions.some(p => 
            requiredPermissions.includes(p)
        );

        if (!hasPermission) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to perform this action' 
            });
        }

        next();
    };
};
