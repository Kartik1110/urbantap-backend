import express from 'express';

// Import segregated route modules
import authRoutes from '@/apps/admin/auth/auth.route';
import profileRoutes from '@/apps/admin/profile/profile.route';
import projectRoutes from '@/apps/admin/project/project.route';
import jobRoutes from '@/apps/admin/job/job.route';
import postRoutes from '@/apps/admin/post/post.route';
import listingRoutes from '@/apps/admin/listing/listing.route';
import roleGroupRoutes from '@/apps/admin/role-group/role-group.route';
import teamMemberRoutes from '@/apps/admin/team-member/team-member.route';
import permissionRoutes from '@/apps/admin/permission/permission.route';
import brokerRoutes from '@/apps/admin/broker/broker.route';
import creditRoutes from '@/apps/admin/credit/credit.route';
import orderRoutes from '@/apps/admin/order/order.route';

const router = express.Router();

// Use segregated route modules
router.use(authRoutes);
router.use(roleGroupRoutes);
router.use(teamMemberRoutes);
router.use(permissionRoutes);
router.use(brokerRoutes);
router.use(creditRoutes);
router.use(orderRoutes);

export default (upload: any) => {
    // Use route modules that require upload middleware
    router.use(profileRoutes(upload));
    router.use(projectRoutes(upload));
    router.use(postRoutes(upload));
    router.use(listingRoutes(upload));
    router.use(jobRoutes);

    return router;
};
