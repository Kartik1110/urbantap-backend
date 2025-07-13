import { Request, Response } from "express";
import { signupAdmin, loginAdmin, changeAdminPassword,editLinkedDeveloper , getDevelopersService, getDeveloperDetailsService, createProjectService} from "../services/adminuser.service";



interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    companyId?: string;
    developerId?: string;
    brokerageId?: string;
  };
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, companyId } = req.body;
    const user = await signupAdmin(email, password, companyId);
    res.status(201).json({ status: "success", data: user });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await loginAdmin(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ status: "success", token });
  } catch (error: any) {
    res.status(401).json({ status: "error", message: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  
  res.status(200).json({
    status: "success",
    message: "Logged out. Token cookie cleared.",
  });
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.id) return res.status(401).json({ message: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing passwords." });
    }

    await changeAdminPassword(user.id, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const editDeveloper = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // or create a custom type if you want strong typing
    if (!user?.id) return res.status(401).json({ message: "Unauthorized" });

    const updateData = req.body;
    const updatedDeveloper = await editLinkedDeveloper(user.id, updateData);

    res.status(200).json({
      status: "success",
      message: "Developer updated successfully.",
      data: updatedDeveloper,
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

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

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.developerId) {
      return res.status(403).json({ status: "error", message: "Unauthorized: No developer linked." });
    }

    // Override the developer_id from token
    const projectData = {
      ...req.body,
      developer_id: req.user.developerId,
    };

    const project = await createProjectService(projectData);

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
}
