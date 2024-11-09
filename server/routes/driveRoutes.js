import express from 'express';
import multer from 'multer';
import uploadToDrive from '../controllers/driveController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Updated route to match the frontend request
router.post('/', upload.single('file'), uploadToDrive);

export default router;