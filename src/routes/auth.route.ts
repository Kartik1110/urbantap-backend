import { Router } from "express";
import { signup, login, googleSignIn, appleSignIn, updateUser, deleteUser } from "../controllers/auth.controller";

const router = Router();

// Mobile app routes
router.post("/google/signin", googleSignIn);
router.post("/apple/signin", appleSignIn);

// Regular auth routes
router.post("/signup", signup);
router.post("/login", login);

router.put('/user/:id', updateUser)
router.delete('/user/:id', deleteUser)

export default router;
