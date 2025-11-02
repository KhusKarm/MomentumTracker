import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { getAuth } from "../firebaseAdmin";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized - Invalid token format" });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    
    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized - Invalid token claims" });
    }

    let user = await storage.getUser(userId);
    
    if (!user) {
      user = await storage.createUser({ id: userId, email });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized - Token verification failed" });
  }
}
