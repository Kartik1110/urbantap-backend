import { PrismaClient, Job, Prisma } from '@prisma/client';
import { ApplyJobInput } from '../schema/job.schema';
import { uploadToS3 } from '../utils/s3Upload';

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

    const resumeUrl = await uploadToS3(
        resume,
        `resumes/${user.id}-${Date.now()}.pdf`
    );

    return await prisma.application.create({
        data: { jobId: jobToApply.id, userId: user.id, resume: resumeUrl },
    });
};

export const createJobService = async (job: Job) => {
    // if (job.userId) {
    //     const user = await prisma.user.findUnique({
    //         where: { id: job.userId, role: Role.HR },
    //     });

    //     if (!user) {
    //         throw new Error('User not found or is not an HR');
    //     }
    // }

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
    body: { page?: number; page_size?: number; search?: string } = {},
    userId?: string
) => {
    const { page = 1, page_size = 10, search = '' } = body;
    const skip = (page - 1) * page_size;
    const take = page_size;

    const whereClause = search
        ? {
            title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
            },
        }
        : {};

    const jobsRaw = await prisma.job.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        where: whereClause,
        select: {
            id: true,
            title: true,
            company_id: true,
            brokerage_id: true,
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
            createdAt: true,
            updatedAt: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                },
            },
            brokerage: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                    _count: {
                        select: { listings: true },
                    },
                },
            },
        },
    });

    // Get all jobIds the user has applied to
    let appliedJobIds: Set<string> = new Set();
    if (userId) {
        const userApplications = await prisma.application.findMany({
            where: { userId },
            select: { jobId: true },
        });
        appliedJobIds = new Set(userApplications.map(app => app.jobId));
    }

    const jobs = jobsRaw.map((job) => {
        if (job.brokerage) {
            const { _count, ...brokerageData } = job.brokerage;
            return {
                ...job,
                brokerage: {
                    ...brokerageData,
                    listings_count: _count.listings,
                },
                applied: appliedJobIds.has(job.id),
            };
        }
        return {
            ...job,
            applied: appliedJobIds.has(job.id),
        };
    });

    const totalJobs = await prisma.job.count({ where: whereClause });
    const totalPages = Math.ceil(totalJobs / page_size);

    return {
        jobs,
        pagination: {
            total: totalJobs,
            totalPages,
            page,
            page_size,
        },
    };
};


export const getJobByIdService = async (id: string) => {
    const job = await prisma.job.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            company_id: true,
            brokerage_id: true,
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
            createdAt: true,
            updatedAt: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
            brokerage: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                    _count: {
                        select: { listings: true },
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

    const cleanedBrokerage = job.brokerage
        ? {
            id: job.brokerage.id,
            name: job.brokerage.name,
            logo: job.brokerage.logo,
            description: job.brokerage.description,
            listings_count: job.brokerage._count?.listings ?? 0,
        }
        : null;

    const returnedJob = {
        ...job,
        brokerage: cleanedBrokerage,
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
            userId: broker.user_id,
        },
        select: {
            id: true,
            resume: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            job: {
                select: {
                    id: true,
                    title: true,
                    company_id: true,
                    brokerage_id: true,
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
                    createdAt: true,
                    updatedAt: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                        },
                    },
                    brokerage: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            description: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return {
        broker: {
            id: brokerId,
            name: broker.name,
            email: broker.email,
        },
        applications,
    };
};
