import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export default generateToken; 