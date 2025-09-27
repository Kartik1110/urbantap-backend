import prisma from '../../../utils/prisma';
import { Job, OrderType } from '@prisma/client';
import { CREDIT_CONFIG } from '../../../config/credit.config';
import { PermissionChecker } from '../../../utils/permissions';
import { deductCreditsAndCreateOrder } from '../../../services/credit.service';

// Create sponsored job with credit deduction
export const createSponsoredJobService = async (
    jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>,
    company_id: string,
    sponsor_duration_days?: number
) => {
    // Validate company exists
    const company = await prisma.company.findUnique({
        where: { id: company_id },
    });

    if (!company) {
        throw new Error('Company not found');
    }

    const creditsRequired = CREDIT_CONFIG.creditPricing.featuredJob;
    const durationDays =
        sponsor_duration_days || CREDIT_CONFIG.visibilityDuration.featuredJob;

    // Calculate expiry date
    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + durationDays);

    // Deduct credits and create order in transaction
    const creditResult = await deductCreditsAndCreateOrder({
        company_id,
        credits: creditsRequired,
        type: OrderType.JOB,
        type_id: '', // Will be updated after job creation
        user_id: jobData.admin_user_id || '',
    });

    const jobObj: any = {
        ...jobData,
        company_id,
        is_sponsored: true,
        expiry_date,
    };

    if (jobData.admin_user_id) {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: jobData.admin_user_id },
            include: {
                broker: {
                    include: {
                        user: {
                            select: { id: true },
                        },
                    },
                },
            },
        });

        if (adminUser?.broker?.user?.id) {
            jobObj.userId = adminUser.broker?.user?.id;
        }
    }

    // Create the sponsored job
    const job = await prisma.job.create({
        data: jobObj,
    });

    // Update the order with the actual job ID
    await prisma.order.update({
        where: { id: creditResult.order.id },
        data: { type_id: job.id },
    });

    return {
        job,
        credits_deducted: creditsRequired,
        remaining_balance: creditResult.remaining_balance,
        expiry_date,
    };
};

/**
 * Get jobs with RBAC filtering
 */
export const getJobsWithRBACService = async (adminUserId: string) => {
    return await PermissionChecker.getAccessibleJobs(adminUserId);
};

/**
 * Get job by ID with RBAC validation
 */
export const getJobByIdWithRBACService = async (
    adminUserId: string,
    jobId: string
) => {
    const canView = await PermissionChecker.canViewJob(adminUserId, jobId);

    if (!canView) {
        throw new Error('Access denied: Cannot view this job');
    }

    return await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
            admin_user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });
};

export const getJobApplicationsService = async (
    jobId: string,
    companyId: string
) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
            company_id: companyId,
        },
    });

    if (!job) {
        throw new Error('Job not found');
    }

    return await prisma.application.findMany({
        where: {
            job_id: jobId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    country_code: true,
                    w_number: true,
                    role: true,
                },
            },
            job: {
                select: {
                    title: true,
                },
            },
        },
    });
};

export const deleteJobService = async (jobId: string, companyId: string) => {
    return await prisma.job.delete({
        where: {
            id: jobId,
            company_id: companyId,
        },
    });
};
