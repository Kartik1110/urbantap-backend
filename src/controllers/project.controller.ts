import { Request, Response } from 'express';
import {
    getProjectsService,
    getProjectByIdService,
    createProjectService,
} from '../services/project.service';

// GET /projects
export const getProjects = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        const title = req.query.title as string;
        const location = req.query.location as string;
        const type = req.query.type as string;
        const developer = req.query.developer as string;

        const { projects, pagination } = await getProjectsService({
            page,
            pageSize,
            title,
            location,
            type,
            developer,
        });

        res.json({
            status: 'success',
            message: 'Projects fetched successfully',
            data: projects,
            pagination,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch projects',
        });
    }
};

// GET /projects/:id
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await getProjectByIdService(id);

        res.json({
            status: 'success',
            message: 'Project details fetched successfully',
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch project details',
            error,
        });
    }
};

// POST /projects
export const createProject = async (req: Request, res: Response) => {
    try {
        const project = await createProjectService(req.body);

        res.json({
            status: 'success',
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create project',
            error,
        });
    }
};
