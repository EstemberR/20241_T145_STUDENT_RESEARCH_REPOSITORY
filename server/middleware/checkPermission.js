import { ADMIN_PERMISSIONS } from '../model/Admin.js';

export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Super admin bypasses permission check
        if (req.user.role === 'superadmin') {
            return next();
        }

        // Check if user has required permission
        if (!req.user.permissions?.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};
