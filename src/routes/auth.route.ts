import { Router } from "express";
import { signup, login, googleSignIn, appleSignIn, updateUser, deleteUser, updateFcmTokenHandler } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateSchema from "../middlewares/validate.middleware";
import {signupSchema,loginSchema,googleSignInSchema,appleSignInSchema,updateUserSchema,updateFcmTokenSchema} from "../schema/auth.schema"; 

const router = Router();

// Mobile app routes
router.post("/google/signin", validateSchema(googleSignInSchema), googleSignIn);
router.post("/apple/signin", validateSchema(appleSignInSchema), appleSignIn);

// Regular auth routes
router.post("/signup", validateSchema(signupSchema), signup);
router.post("/login", validateSchema(loginSchema), login);

router.put("/user/:id", validateSchema(updateUserSchema), updateUser);
router.delete("/user/:id", deleteUser);

// FCM token route (protected)
router.post("/fcm-token/:id", authMiddleware,validateSchema(updateFcmTokenSchema),  updateFcmTokenHandler);

export default router;