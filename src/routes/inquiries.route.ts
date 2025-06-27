import express from 'express';
import { createInquiry, getInquiry } from '../controllers/inquries.controller';
import validateSchema from '../middlewares/validate.middleware';
import { createInquirySchema } from '../schema/inquiries.schema';

const router = express.Router();

// POST endpoint to create an inquiry and notification
router.post('/inquiry/listing/:listing_id',validateSchema(createInquirySchema),createInquiry);

// GET endpoint to retrieve inquiry by inquiry_id
router.get('/inquiry/:inquiry_id', getInquiry);

export default router;
