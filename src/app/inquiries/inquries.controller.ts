import { Request, Response } from 'express';
import { createInquiryAndNotify, getInquiryById } from './inquiries.service';

export const createInquiry = async (req: Request, res: Response) => {
    const { listing_id } = req.params;
    const { text, sent_by_id, sent_to_id, email, name, phone_no, country_code} = req.body;

    try {
        await createInquiryAndNotify({
            listing_id,
            text,
            sent_by_id,
            sent_to_id,
            email,
            name,
            phone_no,
            country_code
        });

        res.status(200).json({
            message: 'Inquiry and notification created successfully.',
        });
    } catch (error) {
        console.error('Error creating inquiry and notification:', error);
        res.status(500).json({ message: 'Failed to create inquiry and notification.' });
    }
};

export const getInquiry = async (req: Request, res: Response) => {
    const { inquiry_id } = req.params;

    try {
        const inquiry = await getInquiryById(inquiry_id);

        if (inquiry) {
            res.status(200).json(inquiry);
        } else {
            res.status(404).json({ message: 'Inquiry not found.' });
        }
    } catch (error) {
        console.error('Error retrieving inquiry:', error);
        res.status(500).json({ message: 'Failed to retrieve inquiry.' });
    }
};
