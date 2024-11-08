import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InquiryData {
    listing_id: string;
    text: string;
    sent_by_id: string;
    sent_to_id: string;
    email: string;
    name: string;
    phone_no: string;
}

export const createInquiryAndNotify = async (data: InquiryData): Promise<void> => {
    const { listing_id, text, sent_by_id, sent_to_id, email, name, phone_no } = data;

    await prisma.$transaction(async (prisma) => {
        // Create the inquiry
        const inquiry = await prisma.inquiry.create({
            data: {
                listing_id,
                text,
                sent_by_id,
                sent_to_id,
                email,
                name,
                phone_no
            }
        });

        // Create the notification for the recipient
        await prisma.notification.create({
            data: {
                broker_id: sent_to_id,
                text: `New inquiry received for listing ${listing_id}`,
                type: 'Enquiries',
                inquiry_id: inquiry.id
            }
        });
    });
};

export const getInquiryById = async (inquiry_id: string) => {
    return prisma.inquiry.findUnique({
        where: { id: inquiry_id },
    });
};
