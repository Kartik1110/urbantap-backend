import express from "express";
import { signup, login, logout, changePassword,editDeveloper, getDevelopers, getDeveloperDetails, createProject } from "../controllers/adminusercontroller";
import { verifyToken } from "../middlewares/verfiyToken";

const router = express.Router();

router.post("/adminuser/signup", signup);

router.post("/adminuser/login", login);

router.post("/adminuser/logout",verifyToken, logout); 

router.post("/adminuser/change-password",verifyToken, changePassword);

router.get('/adminuser/developers',verifyToken, getDevelopers);

router.get('/adminuser/developers/:id',verifyToken, getDeveloperDetails);

export default (upload: any) => {
    router.post(
    '/adminuser/projects', verifyToken, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'floor_plans', maxCount: 10 },
    { name: 'file_url', maxCount: 1 },
  ]), createProject);

    router.put(
    "/adminuser/developer",
    verifyToken,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "cover_image", maxCount: 1 },
    ]),
    editDeveloper
  );

  return router;
};

