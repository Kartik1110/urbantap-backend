import { Router } from 'express';
import { jobSchema } from '@/schema/job.schema';
import { verifyToken } from '@/utils/verifyToken';
import validateSchema from '@/middlewares/validate.middleware';
import {
    requirePermission,
    requireResourceAccess,
} from '@/middlewares/rbac.middleware';
import {
    createSponsoredJobController,
    getJobsForCompanyController,
    getJobByIdController,
    getJobApplicationsController,
    deleteJobController,
} from './job.controller';

const router = Router();

/* Get Jobs for Company */
router.get('/admin-user/jobs', verifyToken, getJobsForCompanyController);

/* Get Job by ID */
router.get('/admin-user/jobs/:id', verifyToken, getJobByIdController);

/* Create Sponsored Job */
router.post(
    '/admin-user/jobs',
    verifyToken,
    requirePermission('CREATE_JOB'),
    validateSchema(jobSchema),
    createSponsoredJobController
);

/* Get Job Applications */
router.get(
    '/admin-user/jobs/:id/applications',
    verifyToken,
    getJobApplicationsController
);

/* Delete Job */
router.delete(
    '/admin-user/jobs/:id',
    verifyToken,
    requireResourceAccess('JOB', 'DELETE'),
    deleteJobController
);

export default router;
