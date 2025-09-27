import { Response, Request, Express } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { uploadToS3 } from '@/utils/s3Upload';
import prisma from '@/utils/prisma';
import {
    getCompanyPostsWithRBACService,
    getCompanyPostByIdWithRBACService,
    getCompanyByIdService,
    editCompanyPostService,
    createSponsoredCompanyPostService,
} from './post.service';

export const getAllCompanyPosts = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const posts = await getCompanyPostsWithRBACService(adminUserId);
        res.json({
            status: 'success',
            message: 'Company posts fetched successfully',
            data: posts,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch company posts',
            error,
        });
    }
};

export const getCompanyPostById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const postId = req.params.id;
        const adminUserId = req.user?.id;

        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const post = await getCompanyPostByIdWithRBACService(
            adminUserId,
            postId
        );

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Company post not found',
            });
        }

        res.json({
            status: 'success',
            message: 'Company post fetched successfully',
            data: post,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch company post',
            error,
        });
    }
};

export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const company = await getCompanyByIdService(id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Company fetched successfully',
            data: company,
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch company',
            error: error.message || error,
        });
    }
};

export const editCompanyPost = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id, title, caption, position } = req.body;
        const files = req.files as Express.Multer.File[];

        let imageUrls: string[] | undefined = undefined;

        if (files && files.length > 0) {
            imageUrls = await Promise.all(
                files.map(async (file) => {
                    const ext = file.originalname.split('.').pop();
                    const fileName = `company_posts/image_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(2)}.${ext}`;
                    return await uploadToS3(file.path, fileName);
                })
            );
        }

        const updated = await editCompanyPostService(id, {
            title,
            caption,
            position,
            ...(imageUrls && { images: imageUrls }),
        });

        res.status(200).json({
            status: 'success',
            message: 'Post updated',
            data: updated,
        });
    } catch (error: any) {
        console.error('Edit CompanyPost error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createSponsoredCompanyPostController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user = req.user;
        if (!user?.companyId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No company linked.',
            });
        }

        const { title, caption, position, sponsor_duration_days } = req.body;

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one image is required.',
            });
        }

        const imageUrls: string[] = await Promise.all(
            files.map(async (file) => {
                const ext = file.originalname.split('.').pop();
                const fileName = `company_posts/image_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2)}.${ext}`;
                return await uploadToS3(file.path, fileName);
            })
        );

        // Get current count of posts to assign rank
        const currentCount = await prisma.companyPost.count();
        const rank = currentCount + 1;

        const result = await createSponsoredCompanyPostService(
            {
                title,
                caption,
                images: imageUrls,
                position,
                rank,
            },
            user.companyId,
            sponsor_duration_days
        );

        res.status(201).json({
            status: 'success',
            message: 'Sponsored company post created successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Create sponsored company post error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Server Error',
        });
    }
};
