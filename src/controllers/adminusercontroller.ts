import { Request, Response } from "express";
import { signupAdmin, loginAdmin } from "../services/adminuser.service";

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
