import { Request, Response } from 'express';
import {
    getDevelopersService,
    createDeveloperService,
    getDeveloperDetailsService,
    getDeveloperProjectsService,
} from '../services/developer.service';

export const getDevelopers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.search as string | undefined;

        const { developers, pagination } = await getDevelopersService({
            page,
            pageSize,
            search,
        });

        res.json({
            status: 'success',
            message: 'Developers fetched successfully',
            data: developers,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch developers',
            error,
        });
    }
};

export const createDeveloper = async (req: Request, res: Response) => {
    try {
        const developer = await createDeveloperService(req.body);
        res.json({
            status: 'success',
            message: 'Developer created successfully',
            data: developer,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create developer',
            error,
        });
    }
};

export const getDeveloperDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const developerDetails = await getDeveloperDetailsService(id);
        res.json({
            status: 'success',
            message: 'Developer details fetched successfully',
            data: developerDetails,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch developer details',
            error,
        });
    }
};

export const getDeveloperProjects = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        
        const { projects, pagination } = await getDeveloperProjectsService(id, {
            page,
            pageSize,
        });

        res.json({
            status: 'success',
            message: 'Developer projects fetched successfully',
            data: projects,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch developer projects',
            error,
        });
    }
};
