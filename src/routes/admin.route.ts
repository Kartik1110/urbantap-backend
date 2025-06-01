import { Router } from "express";
import { getAdminListings } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { updateListingStatus,getUserList } from "../controllers/admin.controller";

const router = Router();

router.use(adminMiddleware);

// Fetch listings (pending first, then approved)
router.get("/admin/listings", getAdminListings);

// Update listing status
router.put("/admin/listings/:id/status", updateListingStatus);

// Fetch Users
router.get("/users", getUserList);

export default router;
