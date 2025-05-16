import { Request, Response } from "express";
import { signupService, loginService, googleSignInService, appleSignInService, updateUserService, deleteUserService, updateFcmTokenService, forgotPasswordService } from "../services/auth.service";
import logger from "../utils/logger";

// Signup controller
export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role, w_number, country_code } = req.body;
  try {
    const result = await signupService(email, password, name, role, w_number, country_code);
    
    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.message === "User with this email already exists") {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: null,
        });
      }
    } else {
      logger.error(String(error));
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await loginService(email, password);
    
    res.json({
      status: true,
      message: "User logged in successfully!",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ error: error.message });
      }
    } else {
      logger.error(String(error));
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Google Sign-in controller
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const result = await googleSignInService(idToken);

    res.json({
      status: true,
      message: "User logged in successfully!",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Apple Sign-in controller
export const appleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken, userIdentifier, email, name } = req.body;
    const result = await appleSignInService(idToken, userIdentifier, email, name);

    res.json({
      status: true,
      message: "User logged in successfully!",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, role, w_number, country_code } = req.body;
    
    const user = await updateUserService(userId, { name, role, w_number, country_code });

    res.json({
      status: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.message === "User ID is required") {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: null,
        });
      }
    } else {
      logger.error(String(error));
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete user controller
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteUserService(id);

    res.status(200).json({
      status: true,
      message: "User and all related data deleted successfully",
      data: null,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.message === "User not found") {
        return res.status(404).json({
          status: false,
          message: error.message,
          data: null,
        });
      }
    } else {
      logger.error(String(error));
    }
    res.status(500).json({
      status: false,
      message: "Error deleting user and related data",
      data: null,
    });
  }
};

export const updateFcmTokenHandler = async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const token = req.headers.authorization;

    const user = await updateFcmTokenService(fcmToken, token as string);
    
    res.json({
      status: true,
      message: "FCM token updated successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Forgot password controller
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const token = await forgotPasswordService(email);
    return res.json({
      status: true,
      message: "Reset token generated successfully.",
      data: { resetToken: token }, // In production, do not return the token
    });
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
