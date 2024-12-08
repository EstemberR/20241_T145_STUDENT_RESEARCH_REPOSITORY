import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server folder
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });
console.log('Looking for .env at:', envPath);

const uploadToDrive = async (req, res) => {
  try {
    console.log('Received file upload request');

    // Check if environment variables are loaded
    if (!process.env.MY_DRIVE_PRIVATE_KEY) {
      console.error('Environment variables not loaded. Check .env file path.');
      throw new Error('Environment variables not loaded');
    }

    // Format the private key properly
    let privateKey = process.env.MY_DRIVE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey
        .replace(/\\n/g, '\n')
    
    }

    // Create credentials object
    const credentials = {
      type: 'service_account',
      project_id: 'gdrive-project-441200',
      private_key_id: '452019265bc70273d28ec434e71d6a55720296a1',
      private_key: process.env.MY_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: 'student-reseach-repository@gdrive-project-441200.iam.gserviceaccount.com',
      client_id: '115495286781539719246',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/student-reseach-repository%40gdrive-project-441200.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    };

    // // Log credentials for debugging (excluding private key)
    // console.log('Using credentials:', {
    //   type: process.env.MY_DRIVE_TYPE,
    //   project_id: process.env.MY_DRIVE_PROJECT_ID,
    //   private_key_id: process.env.MY_DRIVE_PRIVATE_KEY_ID,
    //   private_key: privateKey,
    //   client_email: process.env.MY_DRIVE_CLIENT_EMAIL,
    //   client_id: process.env.MY_DRIVE_CLIENT_ID,
    //   auth_uri: process.env.MY_DRIVE_AUTH_URI,
    //   token_uri: process.env.MY_DRIVE_TOKEN_URI,
    //   auth_provider_x509_cert_url: process.env.MY_DRIVE_AUTH_PROVIDER_X509_CERT_URL,
    //   client_x509_cert_url: process.env.MY_DRIVE_CLIENT_X509_CERT_URL,
    //   universe_domain: process.env.MY_DRIVE_UNIVERSE_DOMAIN
    // });

    // Initialize auth with credentials object
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive', 
          'https://www.googleapis.com/auth/drive.metadata']
    });

    // Get the client and create drive instance
    const drive = google.drive({ version: 'v3', auth: auth });

    // GET THE FILE DATA
    const fileData = req.file;
    if (!fileData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', fileData.originalname);

    // CREATE FOLDER (if it doesn't exist)
    const folderMetadata = {
      name: 'SRRS Uploads',
      mimeType: 'application/vnd.google-apps.folder',
    };

    let folder;
    const folderExists = await drive.files.list({
      q: `name='SRRS Uploads' and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id, name)',
    });

    if (folderExists.data.files.length > 0) {
      folder = folderExists.data.files[0];
    } else {
      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folder = folderResponse.data;
    }

    // Upload file to the folder
    const fileMetadata = {
      name: fileData.originalname,
      parents: [folder.id],
    };

    const media = {
      mimeType: fileData.mimetype,
      body: fs.createReadStream(fileData.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the updated web view link
    const file = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink'
    });

    console.log('File uploaded successfully with ID:', response.data.id);
    console.log('File URL:', file.data.webViewLink);

    res.json({ 
      fileId: response.data.id,
      fileUrl: file.data.webViewLink 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to upload to Google Drive' });
  }
};

export default uploadToDrive;