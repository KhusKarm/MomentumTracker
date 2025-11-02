import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.headers["x-user-id"] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - No user ID provided" });
    }

    let user = await storage.getUser(userId);
    
    if (!user) {
      const email = req.headers["x-user-email"] as string;
      if (email) {
        user = await storage.createUser({ id: userId, email });
      } else {
        return res.status(401).json({ error: "Unauthorized - Invalid user" });
      }
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
