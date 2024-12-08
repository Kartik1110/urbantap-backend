import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";
import { PrismaClient, Role } from "@prisma/client";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const router = Router();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: any
    ) {
      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            role: Role.BROKER,
            password: "",
          },
        });
      }

      return cb(null, user);
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to app
    res.redirect("/");
  }
);

router.post("/signup", signup);
router.post("/login", login);

export default router;
