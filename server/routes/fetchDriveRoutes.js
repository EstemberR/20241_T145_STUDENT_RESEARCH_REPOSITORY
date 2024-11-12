const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const drive = require('../services/drive');
import { default as uploadToDrive, listFiles } from '../controllers/driveController.js';

// ... your other routes ...
router.get('/google-drive/list', listFiles);

router.get('/research-entries', auth, async (req, res) => {
  try {
    // Your logic to fetch files from Google Drive
    const files = await drive.files.list({
      // Your Google Drive API parameters
    });
    res.json(files.data.files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error });
  }
});

module.exports = fetchDriveRoutes; 