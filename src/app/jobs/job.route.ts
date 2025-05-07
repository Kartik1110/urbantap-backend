import multer from "multer";
import { Router } from "express";
import { jobSchema } from "../../schema";
import { applyJob, createJob, getJobs } from "./job.controller";
import validateSchema from "../../middlewares/validate.middleware";

const router = Router();

router.get("/jobs", getJobs);
router.post("/job", validateSchema(jobSchema), createJob);

export default (upload: multer.Multer) => {
  router.post("/job/apply", upload.single("resume"), applyJob);
  return router;
};
