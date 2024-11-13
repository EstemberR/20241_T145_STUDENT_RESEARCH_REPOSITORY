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

const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ role: 'admin' }, 'secretKey', { expiresIn: '1h' });
    res.json({ token, role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export default { googleLogin, adminLogin };
