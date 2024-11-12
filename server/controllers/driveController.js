import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadToDrive = async (req, res) => {
  try {
    console.log('Received file upload request'); // Add logging
    
     // Update the path to point to your GDrive.json file
     const keyFilePath = path.join(__dirname, '..', 'src', './Assets/GDrive.json');
     console.log('Looking for credentials file at:', keyFilePath); // Debug log
 
     // INITIALIZE GOOGLE AUTH
     const auth = new google.auth.GoogleAuth({
       keyFile: keyFilePath,
       scopes: ['https://www.googleapis.com/auth/drive.file'],
     });

     // Create a function to initialize drive
    const initializeDrive = async () => {
      const keyFilePath = path.join(__dirname, '..', 'src', './Assets/GDrive.json');
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      const client = await auth.getClient();
      return google.drive({ version: 'v3', auth: client });
    };
    console.log('Credentials:', {
      ...auth.credentials,
      private_key: '[REDACTED]'
    });

     

     // GET THE CLIENT
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    // GET THE FILE DATA
    const fileData = req.file;
    if (!fileData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', fileData.originalname); // Add logging

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
      parents: [folder.id], // This places the file in the specified folder
    };

    const media = {
      mimeType: fileData.mimetype,
      body: fs.createReadStream(fileData.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink', // Add webViewLink to get the direct URL
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
    res.status(500).json({ error: 'Failed to upload to Google Drive' });
  }
};

export default uploadToDrive;