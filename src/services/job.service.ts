import { uploadToS3 } from '../utils/s3Upload';
import { ApplyJobInput } from '../schema/job.schema';
import { PrismaClient, Job, Prisma, OrderType } from '@prisma/client';
import {
    createPaginationObject,
    getUserAppliedJobIds,
    transformBrokerageData,
} from '../helper';
import { CREDIT_CONFIG } from '../config/credit.config';
import { deductCreditsAndCreateOrder } from './credit.service';

const prisma = new PrismaClient();

export const applyJobService = async (
    job: ApplyJobInput,
    userId: string,
    resume: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const jobToApply = await prisma.job.findUnique({
        where: { id: job.jobId },
    });

    if (!jobToApply) {
        throw new Error('Job not found');
    }

    // check if user already applied for this job
    const jobAlreadyApplied = await prisma.application.findFirst({
        where: {
            job_id: jobToApply.id,
            user_id: user.id,
        },
    });

    if (jobAlreadyApplied) {
        throw new Error('You have already applied for this job');
    }

    const resumeUrl = await uploadToS3(
        resume,
        `resumes/${user.id}-${jobToApply.id}-${Date.now()}.pdf`
    );

    return await prisma.application.create({
        data: { job_id: jobToApply.id, user_id: user.id, resume: resumeUrl },
    });
};

export const createJobService = async (job: Job) => {
    if (job.company_id) {
        const company = await prisma.company.findUnique({
            where: { id: job.company_id },
        });

        if (!company) {
            throw new Error('Company not found');
        }
    }

    return await prisma.job.create({ data: job });
};

export const getJobsService = async (
    body: {
        page?: number;
        page_size?: number;
        search?: string;
        show_expired_sponsored?: boolean;
    } = {},
    userId?: string
) => {
    const {
        page = 1,
        page_size = 10,
        search = '',
        show_expired_sponsored = false,
    } = body;
    const skip = (page - 1) * page_size;

    let whereClause: any = {};

    // Add search filter
    if (search) {
        whereClause.title = {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
        };
    }

    // Add expiry filter for sponsored content unless explicitly requested to show expired
    if (!show_expired_sponsored) {
        if (search) {
            // If we have search, combine with AND
            whereClause = {
                AND: [
                    {
                        title: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        OR: [
                            { is_sponsored: false },
                            { is_sponsored: null },
                            {
                                AND: [
                                    { is_sponsored: true },
                                    { expiry_date: { gt: new Date() } },
                                ],
                            },
                        ],
                    },
                ],
            };
        } else {
            // No search, just expiry filter
            whereClause.OR = [
                { is_sponsored: false },
                { is_sponsored: null },
                {
                    AND: [
                        { is_sponsored: true },
                        { expiry_date: { gt: new Date() } },
                    ],
                },
            ];
        }
    }

    const [jobsRaw, totalJobs, appliedJobIds] = await Promise.all([
        prisma.job.findMany({
            skip,
            take: page_size,
            orderBy: [
                // Prioritize active sponsored jobs
                {
                    is_sponsored: 'desc',
                },
                // Then by creation date
                { created_at: 'desc' },
            ],
            where: whereClause,
            select: {
                id: true,
                title: true,
                company_id: true,
                workplace_type: true,
                location: true,
                job_type: true,
                description: true,
                min_salary: true,
                max_salary: true,
                skills: true,
                currency: true,
                min_experience: true,
                max_experience: true,
                userId: true,
                is_sponsored: true,
                expiry_date: true,
                created_at: true,
                updated_at: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true,
                        brokerage: {
                            select: {
                                id: true,
                                _count: {
                                    select: { listings: true },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.job.count({ where: whereClause }),
        getUserAppliedJobIds(userId || ''),
    ]);

    const jobs = jobsRaw.map((job) => {
        const { company, ...jobWithoutCompany } = job;
        return {
            ...jobWithoutCompany,
            brokerage: transformBrokerageData(company),
            applied: appliedJobIds.has(job.id),
        };
    });

    return {
        jobs,
        pagination: createPaginationObject(totalJobs, page, page_size),
    };
};

export const getJobByIdService = async (id: string, userId?: string) => {
    const job = await prisma.job.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            company_id: true,
            workplace_type: true,
            location: true,
            job_type: true,
            description: true,
            min_salary: true,
            max_salary: true,
            skills: true,
            currency: true,
            min_experience: true,
            max_experience: true,
            userId: true,
            is_sponsored: true,
            created_at: true,
            updated_at: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                    brokerage: {
                        select: {
                            id: true,
                            _count: {
                                select: {
                                    listings: true,
                                },
                            },
                        },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!job) {
        throw new Error('Job not found');
    }

    let applied = false;
    if (userId) {
        const application = await prisma.application.findFirst({
            where: {
                user_id: userId,
                job_id: job.id,
            },
            select: { id: true },
        });
        applied = !!application;
    }

    const cleanedBrokerage = job.company
        ? {
              id: job.company?.brokerage?.id,
              name: job.company.name,
              logo: job.company.logo,
              description: job.company.description,
              listings_count: job.company?.brokerage?._count?.listings ?? 0,
          }
        : null;

    const returnedJob = {
        ...job,
        brokerage: cleanedBrokerage,
        applied,
    };

    return returnedJob;
};

export const getJobsAppliedByBrokerService = async (brokerId: string) => {
    // First, find the broker and get their user ID
    const broker = await prisma.broker.findUnique({
        where: { id: brokerId },
        select: {
            user_id: true,
            name: true,
            email: true,
        },
    });

    if (!broker) {
        throw new Error('Broker not found');
    }

    if (!broker.user_id) {
        throw new Error('Broker does not have an associated user account');
    }

    // Get all applications for this user
    const applications = await prisma.application.findMany({
        where: {
            user_id: broker.user_id,
        },
        select: {
            id: true,
            resume: true,
            status: true,
            created_at: true,
            updated_at: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company_id: true,
                    workplace_type: true,
                    location: true,
                    job_type: true,
                    description: true,
                    min_salary: true,
                    max_salary: true,
                    skills: true,
                    currency: true,
                    min_experience: true,
                    max_experience: true,
                    userId: true,
                    created_at: true,
                    updated_at: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            description: true,
                            type: true,
                            brokerage: {
                                select: {
                                    id: true,
                                    _count: {
                                        select: { listings: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    // Transform the applications to match getJobs format
    const applicationsWithJobs = applications.map((application) => {
        const { company, ...jobWithoutCompany } = application.job;
        return {
            id: application.id,
            resume: application.resume,
            status: application.status,
            created_at: application.created_at,
            updated_at: application.updated_at,
            job: {
                ...jobWithoutCompany,
                brokerage: transformBrokerageData(company),
                applied: true, // Since these are applications, they are always applied
            },
        };
    });

    return {
        broker: {
            id: brokerId,
            name: broker.name,
            email: broker.email,
        },
        applications: applicationsWithJobs,
    };
};

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
    });

    // Create the sponsored job
    const job = await prisma.job.create({
        data: {
            ...jobData,
            company_id,
            is_sponsored: true,
            expiry_date,
        },
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
