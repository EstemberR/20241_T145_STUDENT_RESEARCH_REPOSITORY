import express from 'express';
import './firebaseAdminConfig.js';

const router = express.Router();

router.post('/google', async (req, res) => {
    const { token } = req.body; // Get the token from the request body

    try {
        // Verify the token
        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        // You can now use decodedToken to get user info (e.g., uid, email)
        return res.status(200).json({ message: 'Login successful', uid });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
});

export default router;
