import multer from 'multer';
import { Router } from 'express';

import validateSchema from '../middlewares/validate.middleware';
import { jobSchema } from '../schema/job.schema';
import { applyJob, createJob, getJobs } from '../controllers/job.controller';

const router = Router();

router.get('/jobs', getJobs);
router.post('/job', validateSchema(jobSchema), createJob);

export default (upload: multer.Multer) => {
    router.post('/job/apply', upload.single('resume'), applyJob);
    return router;
};
