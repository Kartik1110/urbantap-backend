import { Request, Response } from 'express';
import { fetchConnectionsByBrokerId, addConnectionRequest, updateConnectionStatus } from '../services/connections.service';

export const getConnectionsByBrokerId = async (req: Request, res: Response) => {
    const { broker_id } = req.params;

    try {
        const connections = await fetchConnectionsByBrokerId(broker_id);
        res.status(200).json(connections);
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ message: 'Failed to retrieve connections.' });
    }
};

export const createConnectionRequest = async (req: Request, res: Response) => {
    const { broker_id } = req.params;
    const { sent_to_id } = req.body;

    try {
        await addConnectionRequest(broker_id, sent_to_id);
        res.status(200).json({ message: 'Connection request and notification created successfully.' });
    } catch (error) {
        console.error('Error creating connection request:', error);
        res.status(500).json({ message: 'Failed to create connection request and notification.' });
    }
};

export const updateConnectionRequestStatus = async (req: Request, res: Response) => {
    const { broker_id, request_id } = req.params;
    const { status } = req.body;

    try {
        await updateConnectionStatus(request_id, broker_id, status);
        res.status(200).json({ message: 'Connection request status updated successfully.' });
    } catch (error) {
        console.error('Error updating connection request status:', error);
        res.status(500).json({ message: 'Failed to update connection request status.' });
    }
};