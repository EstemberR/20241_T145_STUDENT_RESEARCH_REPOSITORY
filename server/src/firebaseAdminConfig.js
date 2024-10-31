import dotenv from 'dotenv';
import admin from 'firebase-admin';
const { auth } = admin;
dotenv.config();

try {
    const serviceAccount = {
    type:process.env.TYPE,
    project_id:process.env.MY_PROJECT_ID,
    private_key_id: process.env.MY_PRIVATE_KEY_ID,
    private_key: process.env.MY_PRIVATE_KEY,
    client_email:process.env.MY_CLIENT_EMAIL,
    client_id:process.env.MY_CLIENT_ID,
    auth_uri:process.env.MY_AUTH_URI,
    token_uri:process.env.MY_TOKEN_URI,
    auth_provider_x509_cert_url:process.env.MY_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_urlwin:process.env.MY_CLIENT_X509_CERT_URL,
    universe_domain:process.env.MY_UNIVERSE_DOMAIN
}
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} catch (error) {
    console.error('Error parsing Firebase service account:', error);
}
export default admin;