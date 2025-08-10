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
        _getUserAppliedJobIds(userId || ''),
    ]);

    const jobs = jobsRaw.map((job) => {
        const { company, ...jobWithoutCompany } = job;
        return {
            ...jobWithoutCompany,
            brokerage: _transformBrokerageData(company),
            applied: appliedJobIds.has(job.id),
        };
    });

    return {
        jobs,
        pagination: _createPaginationObject(totalJobs, page, page_size),
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
                    created_at: true,
                    updated_at: true,
                    company: {
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
            created_at: 'desc',
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

// TODO: Should we move these to a helper methods file?
// Private helper function to transform brokerage data
const _transformBrokerageData = (company: any) => {
    if (!company?.brokerage) return null;

    const { _count, ...brokerageData } = company.brokerage;
    return {
        id: brokerageData.id,
        listings_count: _count.listings,
        company: {
            id: company.id,
            name: company.name,
            logo: company.logo,
            description: company.description,
        },
    };
};

// Private helper function to check if user has applied to jobs
const _getUserAppliedJobIds = async (userId: string): Promise<Set<string>> => {
    if (!userId) return new Set();

    const userApplications = await prisma.application.findMany({
        where: { user_id: userId },
        select: { job_id: true },
    });
    return new Set(userApplications.map((app) => app.job_id));
};

// Private helper function to create pagination object
const _createPaginationObject = (
    total: number,
    page: number,
    page_size: number
) => ({
    total,
    totalPages: Math.ceil(total / page_size),
    page,
    page_size,
});
