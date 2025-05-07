// import { Router } from "express";
// import { signup, login, googleSignIn, appleSignIn, updateUser, deleteUser, updateFcmTokenHandler } from "../controllers/auth.controller";
// import { authMiddleware } from "../middlewares/auth.middleware";

// const router = Router();

// // Mobile app routes
// router.post("/google/signin", googleSignIn);
// router.post("/apple/signin", appleSignIn);

// // Regular auth routes
// router.post("/signup", signup);
// router.post("/login", login);

// router.put('/user/:id', updateUser)
// router.delete('/user/:id', deleteUser)

// // FCM token route (protected)
// router.post('/fcm-token/:id', authMiddleware, updateFcmTokenHandler);

// export default router;

import { Router } from "express";
import {
  signup,
  login,
  googleSignIn,
  appleSignIn,
  updateUser,
  deleteUser,
  updateFcmTokenHandler,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateSchema from "../middlewares/validate.middleware";
import {
  signupSchema,
  loginSchema,
  googleSignInSchema,
  appleSignInSchema,
  updateUserSchema,
} from "../schema/auth.schema"; // <-- this is new

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
router.post("/fcm-token/:id", authMiddleware, updateFcmTokenHandler);

export default router;
