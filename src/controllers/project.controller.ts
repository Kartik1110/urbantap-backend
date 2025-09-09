import { Request, Response } from 'express';
import {
    getProjectsService,
    getProjectByIdService,
    createProjectService,
    getProjectFloorPlansService,
    getProjectsByDeveloperService,
    getFeaturedProjectsService,
    generateProjectROIReportService,
    getProjectAIReportService,
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
        const search = req.query.search as string;

        const { projects, pagination } = await getProjectsService({
            page,
            pageSize,
            title,
            location,
            type,
            developer,
            search,
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

        if (!project) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found',
            });
        }

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

// GET /projects/:id/floorplans
export const getProjectFloorPlans = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bhk = req.query.bhk as string; // BHK filter parameter (e.g., "1Bhk", "2Bhk", "3Bhk", "Studio")

        const floorPlans = await getProjectFloorPlansService(id, bhk);

        res.json({
            status: 'success',
            message: 'Floor plans fetched successfully',
            data: floorPlans,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch floor plans',
            error,
        });
    }
};

// GET /projects/developer/:id
export const getProjectsByDeveloper = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = req.query.search as string;

        const { projects, pagination } = await getProjectsByDeveloperService(
            id,
            {
                page,
                pageSize,
                search,
            }
        );

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

// GET /projects/featured
export const getFeaturedProjects = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        const { projects, pagination } = await getFeaturedProjectsService({
            page,
            pageSize,
        });

        res.json({
            status: 'success',
            message: 'Featured projects fetched successfully',
            data: projects,
            pagination,
        });
    } catch (error) {
        console.error('Error fetching featured projects:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch featured projects',
        });
    }
};

// GET ROI Report for a project
export const generateProjectROIReport = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id;
        const floorPlanId = req.query.floor_plan_id as string;

        if (!floorPlanId) {
            throw new Error('floor_plan_id is required');
        }

        const roiReport = await generateProjectROIReportService(
            projectId,
            floorPlanId
        );

        return res.status(200).json({
            status: 'success',
            message: 'Project ROI report generated successfully',
            data: roiReport,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message:
                (error as Error).message ||
                'Failed to generate project ROI report',
            error,
        });
    }
};

// GET AI Report for a project
export const getAIReport = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id;
        const floorPlanId = req.query.floor_plan_id as string;

        if (!floorPlanId) {
            throw new Error('floor_plan_id is required');
        }

        const aiReport = await getProjectAIReportService(
            projectId,
            floorPlanId
        );

        return res.status(200).json({
            status: 'success',
            message: 'AI report fetched successfully',
            data: aiReport,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: (error as Error).message || 'Failed to fetch AI report',
            error,
        });
    }
};
