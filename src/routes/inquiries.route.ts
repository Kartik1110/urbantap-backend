import express from 'express';
import { createInquiry, getInquiry } from '../controllers/inquries.controller';

const router = express.Router();

// POST endpoint to create an inquiry and notification
router.post('/inquiry/listing/:listing_id', createInquiry);

// GET endpoint to retrieve inquiry by inquiry_id
router.get('/inquiry/:inquiry_id', getInquiry);

export default router;
