import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Other configuration if necessary
    });
} catch (error) {
    console.error('Error parsing Firebase service account:', error);
}
export default admin;