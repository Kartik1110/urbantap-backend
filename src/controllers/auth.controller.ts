import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../utils/logger";

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Signup controller
export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;
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
        email,
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
    const { idToken, name }: { idToken: string, name: string } = req.body;

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
          name: name,
          googleId: payload.sub,
          password: "",
          role: "BROKER",
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
