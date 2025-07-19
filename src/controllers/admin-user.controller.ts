import { Request, Response } from 'express';
import {
    signupAdmin,
    loginAdmin,
    changeAdminPassword,
    editLinkedDeveloper,
    getDevelopersService,
    getDeveloperDetailsService,
    createProjectService,
    getCompanyByIdService,
    createCompanyPostService,
    editCompanyPostService
} from '../services/admin-user.service';
import { uploadToS3 } from '../utils/s3Upload';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        companyId?: string;
        developerId?: string;
        brokerageId?: string;
    };
}

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, companyId } = req.body;
        const user = await signupAdmin(email, password, companyId);
        res.status(201).json({ status: 'success', data: user });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await loginAdmin(email, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ status: 'success', token });
    } catch (error: any) {
        res.status(401).json({ status: 'error', message: error.message });
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out. Token cookie cleared.',
    });
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return res.status(401).json({ message: 'Unauthorized' });

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing passwords.' });
        }

        await changeAdminPassword(user.id, oldPassword, newPassword);
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const editDeveloper = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
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
        };

        if (logoUrl) updateData.logo = logoUrl;
        if (coverImageUrl) updateData.cover_image = coverImageUrl;

        const updatedDeveloper = await editLinkedDeveloper(user.id, updateData);

        res.status(200).json({
            status: 'success',
            message: 'Developer updated successfully.',
            data: updatedDeveloper,
        });
    } catch (error: any) {
        console.error('editDeveloper error:', error);
        res.status(400).json({ status: 'error', message: error.message });
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

export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user?.developerId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No developer linked.',
            });
        }

        const files = req.files as {
            image?: Express.Multer.File[];
            images?: Express.Multer.File[];
            floor_plans?: Express.Multer.File[];
            file_url?: Express.Multer.File[];
        };

        // Upload main image
        let mainImageUrl = '';
        if (files?.image?.[0]) {
            const ext = files.image[0].originalname.split('.').pop();
            mainImageUrl = await uploadToS3(
                files.image[0].path,
                `projects/image_${Date.now()}.${ext}`
            );
        }

        // Upload gallery images
        let galleryImageUrls: string[] = [];
        if (files?.images) {
            for (const file of files.images) {
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/gallery_${Date.now()}_${file.originalname}`
                );
                galleryImageUrls.push(url);
            }
        }

        // Upload floor plan images
        let floorPlanUrls: string[] = [];
        if (files?.floor_plans) {
            for (const file of files.floor_plans) {
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/floorplan_${Date.now()}_${file.originalname}`
                );
                floorPlanUrls.push(url);
            }
        }

        // Upload optional downloadable file
        let fileUrl = '';
        if (files?.file_url?.[0]) {
            const ext = files.file_url[0].originalname.split('.').pop();
            fileUrl = await uploadToS3(
                files.file_url[0].path,
                `projects/file_${Date.now()}.${ext}`
            );
        }

        // Parse body fields
        const {
            title,
            description,
            price,
            address,
            city,
            type,
            project_name,
            project_age,
            no_of_bedrooms,
            no_of_bathrooms,
            furnished,
            property_size,
            payment_plan,
            unit_types,
            amenities,
        } = req.body;

        const projectData = {
            title,
            description,
            price: parseFloat(price),
            address,
            city,
            type,
            project_name,
            project_age,
            no_of_bedrooms,
            no_of_bathrooms,
            furnished,
            property_size: parseFloat(property_size),
            payment_plan,
            unit_types: JSON.parse(unit_types), // expects JSON string
            amenities: JSON.parse(amenities), // expects JSON string
            image: mainImageUrl,
            images: galleryImageUrls,
            floor_plans: floorPlanUrls,
            file_url: fileUrl,
            developer_id: req.user.developerId,
        };

        const project = await createProjectService(projectData);

        res.json({
            status: 'success',
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create project',
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

export const createCompanyPost = async (
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

        const { title, caption } = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        const file = files?.image?.[0];

        if (!file) {
            return res
                .status(400)
                .json({ status: 'error', message: 'Image is required' });
        }

        const ext = file.originalname.split('.').pop();
        const fileName = `company_posts/image_${Date.now()}.${ext}`;

        // Use file.path since multer saved the file to disk
        const imageUrl = await uploadToS3(file.path, fileName);

        const post = await createCompanyPostService({
            title,
            caption,
            image: imageUrl,
            company_id: user.companyId,
        });

        res.status(201).json({
            status: 'success',
            message: 'Post created',
            data: post,
        });
    } catch (error: any) {
        console.error('Create CompanyPost error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const editCompanyPost = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id, title, caption } = req.body;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        let imageUrl: string | undefined = undefined;

        if (files?.image?.[0]) {
            const file = files.image[0];
            const ext = file.originalname.split('.').pop();
            imageUrl = await uploadToS3(
                file.path,
                `company_posts/image_${Date.now()}.${ext}`
            );
        }

        const updated = await editCompanyPostService(id, {
            title,
            caption,
            ...(imageUrl && { image: imageUrl }),
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
