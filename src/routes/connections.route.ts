import express from 'express';
import { getConnectionsByBrokerId, createConnectionRequest, updateConnectionRequestStatus } from '../controllers/connections.controller';

const router = express.Router();

// GET endpoint to retrieve all connections for a specific broker
router.get('/connections/:broker_id', getConnectionsByBrokerId);

// POST endpoint to create a connection request
router.post('/connections/:broker_id/crequest', createConnectionRequest);

// POST endpoint to update the connection request status
router.post('/connections/:broker_id/crequest/:request_id', updateConnectionRequestStatus);

export default router;