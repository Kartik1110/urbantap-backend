import {
    PushNotificationData,
    sendMulticastPushNotification,
} from '@/common/services/firebase.service';
import {
    createSponsoredJobService,
    deleteJobService,
    getJobApplicationsService,
    getJobByIdWithRBACService,
    getJobsWithRBACService,
} from './job.service';
import prisma from '@/utils/prisma';
import { Response } from 'express';
import { NotificationType } from '@prisma/client';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import logger from '@/utils/logger';

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

        const notificationTitle = 'New Job Available!';
        if (!company) throw new Error('Company not found');
        const notificationBody = `${company.name} just posted a new job: ${result.job.title}`;

        // Create broadcast notification in database
        await prisma.notification.create({
            data: {
                sent_by_id: userId,
                text: notificationBody,
                type: NotificationType.Broadcast,
                job_id: result.job.id,
            },
        });

        if (brokers.length > 0) {
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
        }

        // Always return success response regardless of broker count
        return res.status(201).json({
            status: 'success',
            message: 'Sponsored job created successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Create sponsored job error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server Error',
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
