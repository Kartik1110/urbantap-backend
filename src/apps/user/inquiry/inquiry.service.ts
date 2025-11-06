import { createNotificationService } from '@/common/services/notification.service';
import prisma from '@/utils/prisma';

interface InquiryData {
    listing_id: string;
    text: string;
    sent_by_id: string;
    sent_to_id: string;
    email: string;
    name: string;
    phone_no: string;
    country_code: string;
}

export const createInquiryAndNotify = async (
    data: InquiryData
): Promise<void> => {
    const {
        listing_id,
        text,
        sent_by_id,
        sent_to_id,
        email,
        name,
        phone_no,
        country_code,
    } = data;

    await prisma.$transaction(async (prisma) => {
        // Create the inquiry
        const inquiry = await prisma.inquiry.create({
            data: {
                listing_id,
                sent_by_id,
                sent_to_id,
                text,
                email,
                name,
                phone_no,
                country_code,
            },
        });

        // Create the notification for the recipient using the notification service
        await createNotificationService({
            sent_by_id: sent_by_id,
            broker_id: sent_to_id,
            text: `New inquiry received for listing ${listing_id}`,
            type: 'Inquiries',
            inquiry_id: inquiry.id,
        });
    });
};

export const getInquiryById = async (inquiry_id: string) => {
    return prisma.inquiry.findUnique({
        where: { id: inquiry_id },
        select: {
            id: true,
            sent_by_id: true,
            sent_by: {
                select: {
                    name: true,
                    profile_pic: true,
                    company: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            sent_to_id: true,
            timestamp: true,
            listing_id: true,
            text: true,
            email: true,
            name: true,
            phone_no: true,
            country_code: true,
        },
    });
};
