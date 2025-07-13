import express from "express";
import { signup, login, logout, changePassword,editDeveloper, getDevelopers, getDeveloperDetails, createProject } from "../controllers/adminusercontroller";
import { verifyToken } from "../middlewares/verfiyToken";

const router = express.Router();

router.post("/adminuser/signup", signup);

router.post("/adminuser/login", login);

router.post("/adminuser/logout",verifyToken, logout); 

router.post("/adminuser/change-password",verifyToken, changePassword);

router.put("/adminuser/developer",verifyToken, editDeveloper);

router.get('/adminuser/developers',verifyToken, getDevelopers);

router.get('/adminuser/developers/:id',verifyToken, getDeveloperDetails);

router.post('/adminuser/projects',verifyToken, createProject);

export default router;
