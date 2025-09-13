// backend/routes/uploadRoutes.js
import express from 'express';
import  uploadFile  from '../Controllers/uploadController.js';
import { protect } from '../Middleware/auth.js';
import upload from '../Middleware/multer.js'; 

const router = express.Router();

router.route('/file').post(protect, upload.single('file'), uploadFile);

export default router;