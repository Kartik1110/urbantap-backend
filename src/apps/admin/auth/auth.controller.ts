import { Request, Response } from 'express';
import { changeAdminPassword, loginAdmin, signupAdmin } from './auth.service';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, companyId } = req.body;

        await signupAdmin(email, password, companyId);

        res.status(201).json({
            status: 'success',
            message: 'Admin created successfully',
        });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await loginAdmin(email, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ status: 'success', token });
    } catch (error: any) {
        res.status(401).json({ status: 'error', message: error.message });
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out. Token cookie cleared.',
    });
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return res.status(401).json({ message: 'Unauthorized' });

        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
            return res.status(400).json({ message: 'Missing passwords.' });
        }

        await changeAdminPassword(user.id, old_password, new_password);
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
