import express from 'express';
import { getLeads } from './lead.controller';

const router = express.Router();

/* Get all leads for the broker */
router.get('/leads', getLeads);

export default router;
