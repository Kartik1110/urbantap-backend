import { Router } from "express";
import { getAdminListings, updateListingStatus } from "./admin.controller";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = Router();

router.use(adminMiddleware);

// Fetch listings (pending first, then approved)
router.get("/admin/listings", getAdminListings);

// Update listing status
router.put("/admin/listings/:id/status", updateListingStatus);

export default router;
