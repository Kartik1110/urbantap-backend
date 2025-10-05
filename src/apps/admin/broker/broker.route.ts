import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { getBrokers, createBroker } from './broker.controller';
import { requireTeamManagementAccess } from '@/middlewares/rbac.middleware';

export default (upload: any) => {
    const router = Router();

    /* Broker Routes */
    router.get(
        '/admin-user/brokers',
        verifyToken,
        requireTeamManagementAccess(),
        getBrokers
    );

    router.post(
        '/admin-user/broker',
        verifyToken,
        upload.fields([{ name: 'profile_pic', maxCount: 1 }]),
        createBroker
    );

    return router;
};
