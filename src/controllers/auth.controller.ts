import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import appleSignin from "apple-signin-auth";
import { PrismaClient, Role } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import logger from "../utils/logger";

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Signup controller
export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role, w_number, country_code } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); 

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(400).json({
        status: false,
        message: "User with this email already exists",
        data: null,
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        w_number,
        country_code
      },
    });

    // Generate a token for the newly created user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
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

// Login controller
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    const broker = await prisma.broker.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    res.json({
      status: true,
      message: "User logged in successfully!",
      data: {
        token,
        user,
        brokerId: broker ? broker.id : null,
      },
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

// Google Sign-in controller
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken }: { idToken: string } = req.body;

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        status: false,
        message: "Invalid Google token payload",
        data: null,
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.sub,
          password: "",
          name: payload.name || "",
          role: Role.BROKER,
        },
      });
    } else {
      // Update existing user's Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email: payload.email },
          data: { googleId: payload.sub },
        });
      }
    }

    // Check if user has an associated broker
    const broker = await prisma.broker.findUnique({
      where: { email: payload.email },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    res.json({
      status: true,
      message: "User logged in successfully!",
      data: {
        token,
        user_id: user.id,
        name: user.name,
        email: user.email,
        brokerId: broker ? broker.id : null,
      },
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

    // Verify the Apple ID token
    const appleUser = await appleSignin.verifyIdToken(
      idToken,
      {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: true,
      }
    );

    if (!appleUser.email) {
      return res.status(400).json({
        status: false,
        message: "Invalid Apple token payload",
        data: null,
      });
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email },
          { appleId: userIdentifier }
        ]
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email || appleUser.email,
          password: "",
          name: name || "",
          role: Role.BROKER,
          appleId: userIdentifier,
        },
      });
    } else if (!user.appleId) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { appleId: userIdentifier },
        });
      } catch (error) {
        logger.warn('Unable to update appleId - field may not exist in schema');
      }
    }

    // Check if user has an associated broker
    const broker = await prisma.broker.findUnique({
      where: { email: email || appleUser.email },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    res.json({
      status: true,
      message: "User logged in successfully!",
      data: {
        token,
        user_id: user.id,
        name: user.name,
        email: user.email,
        brokerId: broker ? broker.id : null,
      },
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

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: null,
      });
    }
    
    console.log("userId", userId);
    const { name, role } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, role },
    });
    res.json({
      status: true,
      message: "User updated successfully",
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
}

// Delete user controller
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        brokers: {
          include: {
            listings: true,
            notifications: true,
            sentByConnectionRequests: true,
            sentToConnectionRequests: true,
            sentByInquiries: true,
            sentToInquiries: true,
            broker1Connections: true,
            broker2Connections: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: null,
      });
    }

    // Start a transaction to ensure all deletions are atomic
    await prisma.$transaction(async (prisma) => {
      // For each broker associated with the user
      for (const broker of user.brokers) {
        // Delete all inquiries where this broker is involved
        await prisma.inquiry.deleteMany({
          where: {
            OR: [
              { sent_by_id: broker.id },
              { sent_to_id: broker.id }
            ]
          }
        });

        // Delete all connection requests where this broker is involved
        await prisma.connectionRequest.deleteMany({
          where: {
            OR: [
              { sent_by_id: broker.id },
              { sent_to_id: broker.id }
            ]
          }
        });

        // Delete all connections where this broker is involved
        await prisma.connections.deleteMany({
          where: {
            OR: [
              { broker1_id: broker.id },
              { broker2_id: broker.id }
            ]
          }
        });

        // Delete all notifications for this broker
        await prisma.notification.deleteMany({
          where: { broker_id: broker.id }
        });

        // Delete all listings for this broker
        await prisma.listing.deleteMany({
          where: { broker_id: broker.id }
        });

        // Finally delete the broker
        await prisma.broker.delete({
          where: { id: broker.id }
        });
      }

      // Finally delete the user
      await prisma.user.delete({
        where: { id }
      });
    });

    res.status(200).json({
      status: true,
      message: "User and all related data deleted successfully",
      data: null,
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({
      status: false,
      message: "Error deleting user and related data",
      data: null,
    });
  }
};
