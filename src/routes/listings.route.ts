import { Router } from 'express';
import { getListings } from '../controllers/listings.controller';

const router = Router();

router.get('/listings', getListings);

export default router;
