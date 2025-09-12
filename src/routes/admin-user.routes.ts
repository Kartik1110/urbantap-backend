import express from 'express';
import { jobSchema } from '../schema/job.schema';
import { verifyToken } from '../utils/verifyToken';
import validateSchema from '../middlewares/validate.middleware';
import { editProfileSchema } from '../schema/editProfile.schema';
import { createProjectSchema } from '../schema/project.schema';
import {
    signup,
    login,
    logout,
    changePassword,
    getDevelopers,
    getDeveloperDetails,
    createProject,
    getCompanyById,
    editCompanyPost,
    getAllCompanyPosts,
    getCompanyPostById,
    createSponsoredJobController,
    createSponsoredCompanyPostController,
    getJobByIdController,
    editProfile,
    getProfile,
    getJobsForCompanyController,
    getJobApplicationsController,
    getProjects,
    getBrokers,
    getListingsForBrokerage,
    bulkInsertListingsAdmin,
    deleteJobController,
    bulkUpdateListingsSponsorshipController,
    getSponsoredListingsForBrokerage,
} from '../controllers/admin-user.controller';
import {
    createTeamMember,
    getTeamMembers,
    updateTeamMemberRole,
    deleteTeamMember,
    getAvailableBrokers,
    createRoleGroup,
    getRoleGroups,
    getRoleGroupById,
    updateRoleGroup,
    deleteRoleGroup,
    getAvailablePermissions,
    getUserPermissions,
} from '../controllers/team-member.controller';
import {
    requireTeamManagementAccess,
    requirePermission,
    requireResourceAccess,
} from '../middlewares/rbac.middleware';

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

    // router.post(
    //     '/admin-user/company-post',
    //     verifyToken,
    //     upload.array('images'),
    //     createCompanyPost
    // );

    router.post(
        '/admin-user/company-post',
        verifyToken,
        requirePermission('CREATE_COMPANY_POST'),
        upload.array('images'),
        createSponsoredCompanyPostController
    );

    router.put(
        '/admin-user/company-post/:id',
        verifyToken,
        requireResourceAccess('COMPANY_POST', 'EDIT'),
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

/* RBAC Routes - Team Member Management */

// Team member routes (admin only)
router.post(
    '/admin-user/team-members',
    verifyToken,
    requireTeamManagementAccess(),
    createTeamMember
);
router.get(
    '/admin-user/team-members',
    verifyToken,
    requireTeamManagementAccess(),
    getTeamMembers
);
router.put(
    '/admin-user/team-members/:id/role',
    verifyToken,
    requireTeamManagementAccess(),
    updateTeamMemberRole
);
router.delete(
    '/admin-user/team-members/:id',
    verifyToken,
    requireTeamManagementAccess(),
    deleteTeamMember
);
router.get(
    '/admin-user/available-brokers',
    verifyToken,
    requireTeamManagementAccess(),
    getAvailableBrokers
);

// Role group routes (admin only)
router.post(
    '/admin-user/role-groups',
    verifyToken,
    requireTeamManagementAccess(),
    createRoleGroup
);
router.get(
    '/admin-user/role-groups',
    verifyToken,
    requireTeamManagementAccess(),
    getRoleGroups
);
router.get(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    getRoleGroupById
);
router.put(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    updateRoleGroup
);
router.delete(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    deleteRoleGroup
);

/* Broker Routes */
router.get(
    '/admin-user/brokers',
    verifyToken,
    requireTeamManagementAccess(),
    getBrokers
);

router.get('/admin-user/listings', verifyToken, getListingsForBrokerage);

router.get(
    '/admin-user/listings/sponsored',
    verifyToken,
    getSponsoredListingsForBrokerage
);

// Permission routes
router.get('/admin-user/permissions', verifyToken, getAvailablePermissions);
router.get('/admin-user/user-permissions', verifyToken, getUserPermissions);

/* Job Routes */

/* TODO - Deprecate this route as all jobs will be sponsored */
// router.post(
//     '/admin-user/jobs',
//     verifyToken,
//     validateSchema(jobSchema),
//     createJobController
// );

router.post(
    '/admin-user/jobs',
    verifyToken,
    requirePermission('CREATE_JOB'),
    validateSchema(jobSchema),
    createSponsoredJobController
);

router.get('/admin-user/jobs', verifyToken, getJobsForCompanyController);

router.get('/admin-user/jobs/:id', verifyToken, getJobByIdController);

router.get(
    '/admin-user/jobs/:id/applications',
    verifyToken,
    getJobApplicationsController
);

router.delete(
    '/admin-user/jobs/:id',
    verifyToken,
    requireResourceAccess('JOB', 'DELETE'),
    deleteJobController
);

/* Bulk update listings sponsorship */
router.put(
    '/admin-user/listings/sponsor',
    verifyToken,
    bulkUpdateListingsSponsorshipController
);
