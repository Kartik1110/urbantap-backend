import express from "express";
import { signup, login, logout, changePassword,editDeveloper } from "../controllers/adminusercontroller";

const router = express.Router();

router.post("/adminuser/signup", signup);
router.post("/adminuser/login", login);
router.post("/adminuser/logout", logout); 
router.post("/adminuser/change-password", changePassword);
router.put("/adminuser/developer", editDeveloper);

export default router;
