import { Router } from 'express';
import {
    signup,
    login,
    googleSignIn,
    appleSignIn,
    updateUser,
    deleteUser,
    updateFcmToken,
    sendEmailOtp,
    verifyEmailOtp,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Mobile app routes
router.post('/google/signin', googleSignIn);
router.post('/apple/signin', appleSignIn);

// Regular auth routes
router.post('/signup', signup);
router.post('/login', login);

router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

// Email OTP
router.post('/auth/otp-send', sendEmailOtp);
router.post('/auth/otp-verify', verifyEmailOtp);

// FCM token route (protected)
router.post('/fcm-token/:id', authMiddleware, updateFcmToken);

export default router;
