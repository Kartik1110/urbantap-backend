import { z } from 'zod';
import { WorkplaceType, JobType, Currency } from '@prisma/client';

export const jobSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters'),

    description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be less than 2000 characters'),

    // company_id: z
    //     .string()
    //     .min(1, 'Company ID is required'),

    brokerage_id: z
        .string()
        .optional(),

    workplace_type: z.nativeEnum(WorkplaceType, {
        errorMap: () => ({
            message: `Workplace type must be one of: ${Object.values(WorkplaceType).join(', ')}`,
        }),
    }),

    location: z
        .string()
        .min(1, 'Location is required')
        .max(255, 'Location must be less than 255 characters'),

    job_type: z.nativeEnum(JobType, {
        errorMap: () => ({
            message: `Job type must be one of: ${Object.values(JobType).join(', ')}`,
        }),
    }),

    min_salary: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Minimum salary must be positive')
            .max(1_000_000, 'Minimum salary is unreasonably high')
            .optional()
    ),

    max_salary: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Maximum salary must be positive')
            .max(1_000_000, 'Maximum salary is unreasonably high')
            .optional()
    ),

    skills: z
        .string()
        .max(1000, 'Skills must be under 1000 characters')
        .optional(),

    currency: z.nativeEnum(Currency, {
        errorMap: () => ({
            message: `Currency must be one of: ${Object.values(Currency).join(', ')}`,
        }),
    }),

    min_experience: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val) : val),
        z
            .number()
            .int('Experience must be an integer')
            .nonnegative('Experience cannot be negative')
            .max(50, 'Experience is too high')
            .optional()
    ),

    max_experience: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val) : val),
        z
            .number()
            .int('Experience must be an integer')
            .nonnegative('Experience cannot be negative')
            .max(50, 'Experience is too high')
            .optional()
    ),

});

export const applyJobSchema = z.object({
    jobId: z.string().trim().min(1, 'Job ID is required'),
});

export type JobInput = z.infer<typeof jobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
