import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    restaurantId: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // 1. Check if Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      restaurantId: string;
      role: string;
    };

    // 3. Attach user info to request
    req.user = {
      userId: decoded.userId,
      restaurantId: decoded.restaurantId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
