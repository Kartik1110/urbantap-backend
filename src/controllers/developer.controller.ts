import { Request, Response } from 'express';
import { getDevelopersService,createDeveloperService } from '../services/developer.service';

export const getDevelopers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const { developers, pagination } = await getDevelopersService({ page, pageSize });

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
        status: "success",
        message: "Developer created successfully",
        data: developer,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to create developer",
        error,
      });
    }
};
