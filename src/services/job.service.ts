import { uploadToS3 } from '../utils/s3Upload';
import { ApplyJobInput } from '../schema/job.schema';
import { PrismaClient, Job, Prisma } from '@prisma/client';
import {
    createPaginationObject,
    getUserAppliedJobIds,
    transformBrokerageData,
} from '../helper';

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
    body: { page?: number; page_size?: number; search?: string } = {},
    userId?: string
) => {
    const { page = 1, page_size = 10, search = '' } = body;
    const skip = (page - 1) * page_size;

    const whereClause = search
        ? {
              title: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
              },
          }
        : {};

    const [jobsRaw, totalJobs, appliedJobIds] = await Promise.all([
        prisma.job.findMany({
            skip,
            take: page_size,
            orderBy: { created_at: 'desc' },
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
    const jobs = applications.map((application) => {
        const { company, ...jobWithoutCompany } = application.job;
        return {
            ...jobWithoutCompany,
            brokerage: transformBrokerageData(company),
            applied: true, // Since these are applications, they are always applied
            application: {
                id: application.id,
                resume: application.resume,
                status: application.status,
                created_at: application.created_at,
                updated_at: application.updated_at,
            },
        };
    });

    return {
        broker: {
            id: brokerId,
            name: broker.name,
            email: broker.email,
        },
        jobs,
    };
};
