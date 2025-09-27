import {
    getDevelopersService,
    getDeveloperDetailsService,
    editLinkedCompany,
} from './profile.service';
import { uploadToS3 } from '@/utils/s3Upload';
import { Response, Request, Express } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { getProfileService } from '@/services/admin-user.service';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const profile = await getProfileService(user);

        res.status(200).json({
            status: 'success',
            message: 'Profile fetched successfully',
            data: profile,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getDevelopers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.search as string | undefined;

        const { developers, pagination } = await getDevelopersService({
            page,
            pageSize,
            search,
        });

        res.json({
            status: 'success',
            message: 'Developers fetched successfully',
            data: developers,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch developers',
            error,
        });
    }
};

export const getDeveloperDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const developerDetails = await getDeveloperDetailsService(id);
        res.json({
            status: 'success',
            message: 'Developer details fetched successfully',
            data: developerDetails,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch developer details',
            error,
        });
    }
};

export const editProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        let logoUrl = '';
        let coverImageUrl = '';

        // Handle logo upload
        if (files?.logo?.[0]) {
            const file = files.logo[0];
            const ext = file.originalname.split('.').pop();
            logoUrl = await uploadToS3(
                file.path,
                `developers/logo_${Date.now()}.${ext}`
            );
        }

        // Handle cover_image upload
        if (files?.cover_image?.[0]) {
            const file = files.cover_image[0];
            const ext = file.originalname.split('.').pop();
            coverImageUrl = await uploadToS3(
                file.path,
                `developers/cover_${Date.now()}.${ext}`
            );
        }

        // Merge body data
        const updateData: any = {
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            phone: req.body.phone,
            website: req.body.website,
            address: req.body.address,
            ded: req.body.ded,
            rera: req.body.rera,
            service_areas: req.body.service_areas
                ? typeof req.body.service_areas === 'string'
                    ? JSON.parse(req.body.service_areas)
                    : req.body.service_areas
                : undefined,
        };

        if (logoUrl) updateData.logo = logoUrl;
        if (coverImageUrl) updateData.cover_image = coverImageUrl;

        const updatedCompany = await editLinkedCompany(user, updateData);

        res.status(200).json({
            status: 'success',
            message: 'Company updated successfully.',
            data: updatedCompany,
        });
    } catch (error: any) {
        console.error('editDeveloper error:', error);
        res.status(400).json({ status: 'error', message: error.message });
    }
};
