import validateSchema from '../../../middlewares/validate.middleware';
import { editProfileSchema } from '../../../schema/editProfile.schema';
import { verifyToken } from '../../../utils/verifyToken';
import express from 'express';
import {
    editProfile,
    getDeveloperDetails,
    getDevelopers,
    getProfile,
} from './profile.controller';

const router = express.Router();

router.get('/admin-user/developers', verifyToken, getDevelopers);

router.get('/admin-user/developers/:id', verifyToken, getDeveloperDetails);

router.get('/admin-user/profile', verifyToken, getProfile);

export default (upload: any) => {
    router.put(
        '/admin-user/profile',
        verifyToken,
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'cover_image', maxCount: 1 },
        ]),
        validateSchema(editProfileSchema),
        editProfile
    );

    return router;
};
