import express from 'express';
import multer from 'multer';
import path from 'path';
import uploadToDrive from '../controllers/driveController.js';

const router = express.Router();

// Configure multer with more options
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDFs
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.post('/', upload.single('file'), uploadToDrive);

export default router;