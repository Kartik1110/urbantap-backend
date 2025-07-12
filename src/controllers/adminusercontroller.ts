import { Request, Response } from "express";
import { signupAdmin, loginAdmin, changeAdminPassword,editLinkedDeveloper } from "../services/adminuser.service";
import jwt from "jsonwebtoken";

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: "error", message: "oldPassword and newPassword are required." });
    }

    await changeAdminPassword(decoded.id, oldPassword, newPassword);

    res.status(200).json({ status: "success", message: "Password changed successfully." });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const editDeveloper = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const updateData = req.body;

    const updatedDeveloper = await editLinkedDeveloper(decoded.id, updateData);

    // await editLinkedDeveloper(decoded.id, updateData);

    
    res.status(200).json({
      status: "success",
      message: "Developer updated successfully.",
      data: updatedDeveloper
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ status: "error", message: error.message });
  }
};


