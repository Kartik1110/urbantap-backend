import { z } from "zod";
import { Role } from "@prisma/client";


export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    role: z.enum(["BROKER", "OTHER", "ADMIN","HR","SM"]), 
    w_number: z.string().optional(),
    country_code: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const googleSignInSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
  }),
});

export const appleSignInSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
    userIdentifier: z.string().min(1),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const updateUserSchema = z.object({
    body: z.object({
      name: z.string().optional(),
      role: z.nativeEnum(Role).optional(),
      w_number: z.string().optional(),
      country_code: z.string().optional(),
    }),
    params: z.object({
      id: z.string().uuid(), 
    }),
  });

export const updateFcmTokenSchema = z.object({
    body: z.object({
      fcmToken: z.string().min(1),
    }),
    params: z.object({
      id: z.string().uuid(),
    }),
  });