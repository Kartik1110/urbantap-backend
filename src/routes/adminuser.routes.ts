import express from "express";
import { signup, login, logout } from "../controllers/adminusercontroller";

const router = express.Router();

router.post("/adminuser/signup", signup);
router.post("/adminuser/login", login);
router.post("/adminuser/logout", logout); 

export default router;
