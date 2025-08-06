import { Router } from 'express';
import { loginvalidation, signupvalidation } from '../Middleware/Validation.js';
import { login, signup, uploadAvatar } from '../Components/AccessLogic.js';
import upload from '../Middleware/multer.js';
import { protect } from '../Middleware/auth.js';

const router = Router();

router.post('/signup', signupvalidation, signup);
router.post('/login', loginvalidation, login);

router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
