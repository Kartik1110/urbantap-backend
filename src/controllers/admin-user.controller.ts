import {
    signupAdmin,
    loginAdmin,
    changeAdminPassword,
    editLinkedCompany,
    getDevelopersService,
    getDeveloperDetailsService,
    createProjectService,
    getCompanyByIdService,
    createCompanyPostService,
    createSponsoredCompanyPostService,
    editCompanyPostService,
    createJobService,
    getProfileService,
    getJobApplicationsService,
    getProjectsService,
    getListingsForBrokerageService,
    getBrokersService,
    createListingService,
    bulkInsertListingsAdminService,
    deleteJobService,
    getJobsWithRBACService,
    getCompanyPostsWithRBACService,
    getJobByIdWithRBACService,
    getCompanyPostByIdWithRBACService,
    bulkUpdateListingsSponsorshipService,
    getSponsoredListingsForBrokerageService,
} from '../services/admin-user.service';
import { Express } from 'express';
import prisma from '../utils/prisma';
import { Request, Response } from 'express';
import { uploadToS3 } from '../utils/s3Upload';
import { createSponsoredJobService } from '../services/job.service';
import { AuthenticatedRequest } from '../utils/verifyToken';
import {
    CompanyType,
    Currency,
    Listing,
    NotificationType,
} from '@prisma/client';
import {
    sendMulticastPushNotification,
    PushNotificationData,
} from '../services/firebase.service';
import { v4 as uuidv4 } from 'uuid';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, companyId } = req.body;

        await signupAdmin(email, password, companyId);

        res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
        });
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

        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
            return res.status(400).json({ message: 'Missing passwords.' });
        }

        await changeAdminPassword(user.id, old_password, new_password);
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
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

export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user?.entityId) {
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
            category,
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
            min_price: parseFloat(price),
            address,
            city,
            category,
            project_name,
            project_age,
            min_bedrooms: no_of_bedrooms,
            min_bathrooms: no_of_bathrooms,
            furnished,
            property_size: parseFloat(property_size),
            payment_plan,
            unit_types: JSON.parse(unit_types), // expects JSON string
            amenities: JSON.parse(amenities), // expects JSON string
            image: mainImageUrl,
            images: galleryImageUrls,
            file_url: fileUrl,
            developer_id: req.user.entityId,
            currency: Currency.AED,
            developer: {
                connect: {
                    id: req.user.entityId,
                },
            },
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

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const entityData = req.user?.entityId;
        const type = req.user?.type;

        if (!entityData || !type || type !== CompanyType.Developer) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const projects = await getProjectsService(entityData);

        res.status(200).json({
            status: 'success',
            message: 'Projects fetched successfully',
            data: projects,
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch projects',
            error: error.message || error,
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

        const { title, caption, position } = req.body;

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

        const post = await createCompanyPostService({
            title,
            caption,
            images: imageUrls,
            company_id: user.companyId,
            rank,
            position,
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

export const createJobController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const { id: userId, companyId } = req.user;

        const jobData = {
            ...req.body,
            admin_user_id: userId,
            companyId,
        };

        const job = await createJobService(jobData);

        return res.status(201).json({
            status: 'success',
            data: job,
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: err instanceof Error ? err.message : 'Server Error',
        });
    }
};

export const getJobsForCompanyController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const jobs = await getJobsWithRBACService(adminUserId);

        res.status(200).json({
            status: 'success',
            data: jobs,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getJobByIdController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const jobId = req.params.id;
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const job = await getJobByIdWithRBACService(adminUserId, jobId);

        if (!job) {
            return res
                .status(404)
                .json({ status: 'error', message: 'Job not found' });
        }

        res.status(200).json({
            status: 'success',
            data: job,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getJobApplicationsController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const jobId = req.params.id;
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res
                .status(400)
                .json({ message: 'Company ID not found for user' });
        }

        const applications = await getJobApplicationsService(jobId, companyId);

        res.status(200).json({
            status: 'success',
            data: applications,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteJobController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const jobId = req.params.id;
        const companyId = req.user?.companyId;

        if (!companyId) {
            return res
                .status(400)
                .json({ message: 'Company ID not found for user' });
        }

        const job = await deleteJobService(jobId, companyId);

        res.status(200).json({
            status: 'success',
            data: job,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getBrokers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found for user',
            });
        }
        const users = await getBrokersService(companyId);

        res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getListingsForBrokerage = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const brokerageId = req.user?.entityId;
        if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const listings = await getListingsForBrokerageService(brokerageId);

        res.status(200).json({
            status: 'success',
            data: listings,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createListing = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const brokerageId = req.user?.entityId;
        if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const listing = await createListingService(req.body, brokerageId);

        res.status(201).json({
            status: 'success',
            data: listing,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/* Bulk insert listings */
export const bulkInsertListingsAdmin = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const images = req.files as Express.Multer.File[] | undefined;
    const listings = req.body.listings;

    const brokerageId = req.user?.entityId;
    console.log('brokerageId:::', brokerageId, req.user?.type);
    if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
        });
    }

    let imageUrls: string[] = [];

    // Only process images if they exist
    if (images && images.length > 0) {
        try {
            imageUrls = await Promise.all(
                images.map(async (image) => {
                    const fileExtension = image.originalname.split('.').pop();
                    return await uploadToS3(
                        image.path,
                        `listings/${Date.now()}-${uuidv4()}.${fileExtension}`
                    );
                })
            );
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload images to S3',
                error: error,
            });
        }
    }

    const listingsWithImages = JSON.parse(listings).map((listing: Listing) => ({
        ...listing,
        image_urls: imageUrls,
    }));

    try {
        const listings = await bulkInsertListingsAdminService(
            listingsWithImages,
            brokerageId
        );
        res.json({
            status: 'success',
            message: 'Listings inserted successfully',
            data: listings,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to insert listings',
            error: error,
        });
    }
};

export const createSponsoredJobController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const { id: userId, companyId } = req.user;

        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'No company linked to user',
            });
        }

        const { sponsor_duration_days, ...jobBody } = req.body;

        const jobData = {
            ...jobBody,
            admin_user_id: userId,
        };

        const result = await createSponsoredJobService(
            jobData,
            companyId,
            sponsor_duration_days
        );

        // Send broadcast notification to all brokers
        try {
            // Get company details for notification
            const company = await prisma.company.findUnique({
                where: { id: companyId },
            });

            // Get all brokers with FCM tokens
            const brokers = await prisma.broker.findMany({
                where: {
                    user: {
                        fcm_token: {
                            not: null,
                        },
                    },
                },
                include: {
                    user: true,
                },
            });

            if (brokers.length > 0 && company) {
                const notificationTitle = 'New Job Available!';
                const notificationBody = `${company.name} just posted a new job: ${result.job.title}`;

                // Prepare notifications for all brokers
                const notifications: PushNotificationData[] = brokers.map(
                    (broker) => ({
                        token: broker.user!.fcm_token!,
                        title: notificationTitle,
                        body: notificationBody,
                        data: {
                            jobId: result.job.id,
                            type: 'NEW_JOB_ALERT',
                            companyId: companyId,
                        },
                    })
                );

                // Send multicast push notification
                await sendMulticastPushNotification(notifications);

                // Create broadcast notification in database
                await prisma.notification.create({
                    data: {
                        sent_by_id: userId,
                        broker_id: '', // Broadcast, Not sent by one broker
                        text: notificationBody,
                        type: NotificationType.Broadcast,
                        job_id: result.job.id,
                    },
                });
            }
        } catch (notificationError) {
            console.error('Error sending job notification:', notificationError);
            // Don't fail the job creation if notification fails
        }

        return res.status(201).json({
            status: 'success',
            message: 'Sponsored job created successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Create sponsored job error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server Error',
        });
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

export const bulkUpdateListingsSponsorshipController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { listingIds } = req.body;

        if (
            !listingIds ||
            !Array.isArray(listingIds) ||
            listingIds.length === 0
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'listingIds must be a non-empty array of strings',
            });
        }

        if (listingIds.some((id) => typeof id !== 'string')) {
            return res.status(400).json({
                status: 'error',
                message: 'All listing IDs must be strings',
            });
        }

        const updatedListings =
            await bulkUpdateListingsSponsorshipService(listingIds);

        res.status(200).json({
            status: 'success',
            message: `Successfully updated ${updatedListings.count} listings to sponsored`,
            data: {
                updatedCount: updatedListings.count,
                listingIds,
            },
        });
    } catch (error: any) {
        console.error('Bulk update listings sponsorship error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update listings sponsorship',
        });
    }
};

export const getSponsoredListingsForBrokerage = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const brokerageId = req.user?.entityId;
        if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
            return res.status(401).json({
                status: 'error',
                message:
                    'Unauthorized: Only brokerage companies can access this endpoint',
            });
        }

        const sponsoredListings =
            await getSponsoredListingsForBrokerageService(brokerageId);

        res.status(200).json({
            status: 'success',
            message: 'Sponsored listings fetched successfully',
            data: sponsoredListings,
            count: sponsoredListings.length,
        });
    } catch (error: any) {
        console.error('Get sponsored listings error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch sponsored listings',
        });
    }
};
