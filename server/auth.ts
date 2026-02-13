import type { Express, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function setupAuth(app: Express) {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "care-ops-hub-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          // For demo purposes, we'll use a simple email-based auth
          // In production, you'd want proper password hashing
          const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
          
          if (user.length === 0) {
            // Create a new user if doesn't exist (for demo)
            const newUser = await db.insert(users).values({
              email,
              firstName: email.split("@")[0],
            }).returning();
            return done(null, newUser[0]);
          }
          
          return done(null, user[0]);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      done(null, user[0] || null);
    } catch (error) {
      done(error);
    }
  });
}

export function registerAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", passport.authenticate("local"), (req: Request, res: Response) => {
    res.json(req.user);
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
