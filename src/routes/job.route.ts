import { Router } from "express";
import { createJob, getJobs } from "../controllers/job.controller";
import validateSchema from "../middlewares/validate.middleware";
import { jobSchema } from "../schema/job.schema";

const router = Router();

router.get("/jobs", getJobs);
router.post("/job", validateSchema(jobSchema), createJob);

export default router;