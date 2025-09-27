import { OrderType } from '@prisma/client';
import { CREDIT_CONFIG } from '@/config/credit.config';
import prisma from '@/utils/prisma';

export interface AssignCreditsInput {
    company_id: string;
    credits: number;
    expiry_days?: number;
}

export interface DeductCreditsInput {
    company_id: string;
    credits: number;
    type: OrderType;
    type_id: string;
    user_id?: string;
}

export class CreditService {
    // Assign credits to a company
    static async assignCreditsToCompany({
        company_id,
        credits,
        expiry_days = CREDIT_CONFIG.defaultExpiryDays,
    }: AssignCreditsInput) {
        // Validate company exists
        const company = await prisma.company.findUnique({
            where: { id: company_id },
        });

        if (!company) {
            throw new Error('Company not found');
        }

        if (credits <= 0) {
            throw new Error('Credits must be a positive number');
        }

        const expiry_date = new Date();
        expiry_date.setDate(expiry_date.getDate() + expiry_days);

        // Check if company already has credits
        const existingCredit = await prisma.credit.findUnique({
            where: { company_id },
        });

        await prisma.order.create({
            data: {
                company_id,
                type: OrderType.CREDIT,
                credits_spent: credits,
            },
        });

        if (existingCredit) {
            // Update existing credits
            return await prisma.credit.update({
                where: { company_id },
                data: {
                    balance: existingCredit.balance + credits,
                    expiry_date,
                    updated_at: new Date(),
                },
            });
        } else {
            // Create new credit record
            return await prisma.credit.create({
                data: {
                    company_id,
                    balance: credits,
                    expiry_date,
                },
            });
        }
    }

    // Get company credit balance
    static async getCompanyCreditBalance(company_id: string) {
        const credit = await prisma.credit.findUnique({
            where: { company_id },
        });

        if (!credit) {
            return {
                balance: 0,
                expiry_date: null,
                start_date: null,
                is_expired: true,
            };
        }

        const now = new Date();
        const is_expired = credit.expiry_date < now;

        return {
            balance: is_expired ? 0 : credit.balance,
            expiry_date: credit.expiry_date,
            start_date: credit.start_date,
            is_expired,
        };
    }

    // Check if company has sufficient credits
    static async checkSufficientCredits(
        company_id: string,
        required_credits: number
    ): Promise<{
        sufficient: boolean;
        current_balance: number;
        is_expired: boolean;
    }> {
        const creditInfo = await this.getCompanyCreditBalance(company_id);

        return {
            sufficient:
                !creditInfo.is_expired &&
                creditInfo.balance >= required_credits,
            current_balance: creditInfo.balance,
            is_expired: creditInfo.is_expired,
        };
    }

    // Deduct credits and create order
    static async deductCreditsAndCreateOrder({
        company_id,
        credits,
        type,
        type_id,
        user_id,
    }: DeductCreditsInput) {
        // Check if company has sufficient credits
        const creditCheck = await this.checkSufficientCredits(
            company_id,
            credits
        );

        if (!creditCheck.sufficient) {
            if (creditCheck.is_expired) {
                throw new Error(
                    'Credits have expired. Please purchase new credits.'
                );
            }
            throw new Error(
                `Insufficient credits. Required: ${credits}, Available: ${creditCheck.current_balance}`
            );
        }

        // Start transaction
        return await prisma.$transaction(async (tx) => {
            // Deduct credits
            const updatedCredit = await tx.credit.update({
                where: { company_id },
                data: {
                    balance: {
                        decrement: credits,
                    },
                    updated_at: new Date(),
                },
            });

            // Create order record
            const order = await tx.order.create({
                data: {
                    company_id,
                    type,
                    credits_spent: credits,
                    type_id,
                    admin_user_id: user_id,
                },
            });

            return {
                updatedCredit,
                order,
                remaining_balance: updatedCredit.balance,
            };
        });
    }

    // Clean up expired credits (for background job)
    static async cleanupExpiredCredits() {
        const now = new Date();

        const expiredCredits = await prisma.credit.updateMany({
            where: {
                expiry_date: {
                    lt: now,
                },
                balance: {
                    gt: 0,
                },
            },
            data: {
                balance: 0,
                updated_at: now,
            },
        });

        return expiredCredits;
    }
}
