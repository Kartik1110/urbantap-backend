import { Router } from 'express';
import {
    signup,
    login,
    googleSignIn,
    appleSignIn,
    updateUser,
    deleteUser,
    updateFcmTokenHandler,
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

// FCM token route (protected)
router.post('/fcm-token/:id', authMiddleware, updateFcmTokenHandler);

export default router;
