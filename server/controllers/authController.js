const jwt = require('jsonwebtoken');
const adminCredentials = { email: "admin@gmail.com",
                           password: "adminpassword"
                          };

const verifyGoogleToken = async (token) => {
  const dummyData = { role: Math.random() > 0.5 ? 'student' : 'instructor' };
  return dummyData;
};

// Google Login Controller
const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const userData = await verifyGoogleToken(token);

    const userToken = jwt.sign({ role: userData.role }, 'secretKey', { expiresIn: '1h' });
    res.json({ token: userToken, role: userData.role });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

const adminLogin = async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;
        console.log('Login attempt for:', email); // Debug log

        // Verify recaptcha
        if (!recaptchaToken) {
            return res.status(400).json({ message: "Please complete the ReCAPTCHA verification." });
        }

        // Superadmin check
        if (email === 'superadmin@buksu.edu.ph' && password === 'BuksuSuperAdmin2024') {
            console.log('Superadmin login successful'); // Debug log
            const token = jwt.sign(
                {
                    role: 'superadmin',
                    email: email,
                    name: 'Super Administrator'
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                name: 'Super Administrator',
                role: 'superadmin',
                email: email
            });
        }

        // If not superadmin, proceed with regular admin login
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token for admin
        const token = jwt.sign(
            {
                userId: admin._id,
                role: admin.role,
                email: admin.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            name: admin.name,
            role: admin.role,
            email: admin.email
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

export default { googleLogin, adminLogin };
