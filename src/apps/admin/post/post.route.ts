import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import {
    requirePermission,
    requireResourceAccess,
} from '@/middlewares/rbac.middleware';
import {
    getAllCompanyPosts,
    getCompanyPostById,
    createSponsoredCompanyPostController,
    editCompanyPost,
    getCompanyById,
} from './post.controller';

const router = Router();

router.get('/admin-user/company/:id', verifyToken, getCompanyById);

router.get('/admin-user/company-posts', verifyToken, getAllCompanyPosts);

router.get('/admin-user/company-posts/:id', verifyToken, getCompanyPostById);

export default (upload: any) => {
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

    return router;
};
