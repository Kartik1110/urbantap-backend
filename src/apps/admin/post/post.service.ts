import prisma from '@/utils/prisma';
import { PermissionChecker } from '@/utils/permissions';
import { PostPosition, OrderType } from '@prisma/client';
import { CREDIT_CONFIG } from '@/config/credit.config';
import { deductCreditsAndCreateOrder } from '@/services/credit.service';

/**
 * Get company posts with RBAC filtering
 */
export const getCompanyPostsWithRBACService = async (adminUserId: string) => {
    return await PermissionChecker.getAccessibleCompanyPosts(adminUserId);
};

/**
 * Get company post by ID with RBAC validation
 */
export const getCompanyPostByIdWithRBACService = async (
    adminUserId: string,
    postId: string
) => {
    const canView = await PermissionChecker.canViewCompanyPost(
        adminUserId,
        postId
    );

    if (!canView) {
        throw new Error('Access denied: Cannot view this company post');
    }

    return await prisma.companyPost.findUnique({
        where: { id: postId },
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

/**
 * Get company by ID
 */
export const getCompanyByIdService = async (companyId: string) => {
    return await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            brokers: {
                include: {
                    listings: true,
                },
            },
            developer: true,
            brokerage: true,
        },
    });
};

/**
 * Edit company post
 */
export const editCompanyPostService = async (
    id: string,
    updateData: {
        title?: string;
        caption?: string;
        images?: string[];
        position?: PostPosition;
    }
) => {
    return await prisma.companyPost.update({
        where: { id },
        data: updateData,
    });
};

/**
 * Create sponsored company post
 */
export const createSponsoredCompanyPostService = async (
    postData: {
        title?: string;
        caption?: string;
        images: string[];
        position: PostPosition;
        rank: number;
    },
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

    const creditsRequired = CREDIT_CONFIG.creditPricing.featuredCompanyPost;
    const durationDays =
        sponsor_duration_days ||
        CREDIT_CONFIG.visibilityDuration.featuredCompanyPost;

    // Calculate expiry date
    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + durationDays);

    // Deduct credits and create order in transaction
    const creditResult = await deductCreditsAndCreateOrder({
        company_id,
        credits: creditsRequired,
        type: OrderType.COMPANY_POST,
        type_id: '', // Will be updated after post creation
    });

    // Create the sponsored company post
    const post = await prisma.companyPost.create({
        data: {
            ...postData,
            company_id,
            is_sponsored: true,
            expiry_date,
        },
    });

    // Update the order with the actual post ID
    await prisma.order.update({
        where: { id: creditResult.order.id },
        data: { type_id: post.id },
    });

    return {
        post,
        credits_deducted: creditsRequired,
        remaining_balance: creditResult.remaining_balance,
        expiry_date,
    };
};
