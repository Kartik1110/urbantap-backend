import express from 'express';
import { jobSchema } from '../schema/job.schema';
import { verifyToken } from '../middlewares/verfiyToken';
import validateSchema from '../middlewares/validate.middleware';
import { editProfileSchema } from '../schema/editProfile.schema';
import { createProjectSchema } from '../schema/createProject.schema';
import {
    signup,
    login,
    logout,
    changePassword,
    getDevelopers,
    getDeveloperDetails,
    createProject,
    getCompanyById,
    createCompanyPost,
    editCompanyPost,
    getAllCompanyPosts,
    getCompanyPostById,
    createJobController,
    getJobByIdController,
    editProfile,
    getProfile,
    getJobsForCompanyController,
    getJobApplicationsController,
    getProjects,
    getBrokers,
    getListingsForBrokerage,
    bulkInsertListingsAdmin,
} from '../controllers/admin-user.controller';

const router = express.Router();

/* Auth Routes */
router.post('/admin-user/signup', signup);
router.post('/admin-user/login', login);
router.post('/admin-user/logout', verifyToken, logout);
router.post('/admin-user/change-password', verifyToken, changePassword);

/* Profile Routes */
router.get('/admin-user/profile', verifyToken, getProfile);

router.get('/admin-user/developers', verifyToken, getDevelopers);

router.get('/admin-user/developers/:id', verifyToken, getDeveloperDetails);

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

    /* Project Routes */
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

    router.get('/admin-user/projects', verifyToken, getProjects);

    router.post(
        '/admin-user/company-post',
        verifyToken,
        upload.array('images'),
        createCompanyPost
    );

    router.put(
        '/admin-user/company-post',
        verifyToken,
        upload.array('images'),
        editCompanyPost
    );

    /* Bulk insert listings */
    router.post(
        '/admin-user/listings/bulk',
        verifyToken,
        upload.array('images'),
        bulkInsertListingsAdmin
    );

    // router.post(
    //     '/admin-user/listings',
    //     verifyToken,
    //     upload.array('images'),
    //     createListing
    // );

    return router;
};

router.get('/admin-user/company/:id', verifyToken, getCompanyById);

router.get('/admin-user/company-posts', verifyToken, getAllCompanyPosts);

router.get('/admin-user/company-posts/:id', verifyToken, getCompanyPostById);

/* Job Routes */
router.post(
    '/admin-user/jobs',
    verifyToken,
    validateSchema(jobSchema),
    createJobController
);

router.get('/admin-user/jobs', verifyToken, getJobsForCompanyController);

router.get('/admin-user/jobs/:id', verifyToken, getJobByIdController);

router.get(
    '/admin-user/jobs/:id/applications',
    verifyToken,
    getJobApplicationsController
);

/* Broker Routes */
// Note:  this should be /users to get users for a company but now user is not mapped to a company
router.get('/admin-user/brokers', verifyToken, getBrokers);

router.get('/admin-user/listings', verifyToken, getListingsForBrokerage);
