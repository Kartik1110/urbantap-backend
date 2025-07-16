import express from 'express';
import {
    signup,
    login,
    logout,
    changePassword,
    editDeveloper,
    getDevelopers,
    getDeveloperDetails,
    createProject,
    getCompanyById,
} from '../controllers/admin-user.controller';
import { verifyToken } from '../middlewares/verfiyToken';
import { createProjectSchema } from '../schema/createProjectschema';
import { editDeveloperSchema } from '../schema/editDeveloperSchema';
import validateSchema from '../middlewares/validate.middleware';

const router = express.Router();

router.post('/admin-user/signup', signup);

router.post('/admin-user/login', login);

router.post('/admin-user/logout', verifyToken, logout);

router.post('/admin-user/change-password', verifyToken, changePassword);

router.get('/admin-user/developers', verifyToken, getDevelopers);

router.get('/admin-user/developers/:id', verifyToken, getDeveloperDetails);

export default (upload: any) => {
    router.post(
        '/admin-user/projects',
        verifyToken,
        upload.fields([
            { name: 'image', maxCount: 1 },
            { name: 'images', maxCount: 10 },
            { name: 'floor_plans', maxCount: 10 },
            { name: 'file_url', maxCount: 1 },
        ]),
        validateSchema(createProjectSchema),
        createProject
    );

    router.put(
        '/admin-user/developer',
        verifyToken,
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'cover_image', maxCount: 1 },
        ]),
        validateSchema(editDeveloperSchema),
        editDeveloper
    );

    return router;
};

router.get('/admin-user/company/:id', verifyToken, getCompanyById);
