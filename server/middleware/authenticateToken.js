// middleware/authenticateToken.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token, forbidden
        req.user = user;
        next();
    });
};

export default authenticateToken;
