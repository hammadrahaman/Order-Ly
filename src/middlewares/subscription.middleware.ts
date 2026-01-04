import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthRequest } from "./auth.middleware";

export async function subscriptionMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const restaurantId = req.user.restaurantId;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const now = new Date();

  /** 1. ACTIVE subscription */
  if (restaurant.subscriptionStatus === "ACTIVE") {
    return next();
  }

  /** 2. TRIAL but expired → mark EXPIRED */
  if (
    restaurant.subscriptionStatus === "TRIAL" &&
    restaurant.trialEndsAt &&
    restaurant.trialEndsAt < now
  ) 
{
    return res.status(402).json({
      message: "Subscription expired. Please subscribe to continue.",
    });
  
}  
  /** 3. Valid TRIAL */
  if (
    restaurant.subscriptionStatus === "TRIAL" &&
    restaurant.trialEndsAt &&
    restaurant.trialEndsAt >= now
  ) {
    return next();
  }

  /** 4. EXPIRED */
  if (restaurant.subscriptionStatus === "EXPIRED") {
    return res.status(402).json({
      message: "Subscription expired. Please renew to continue.",
    });
  }

  /** 5. CANCELLED or unknown */
  return res.status(403).json({
    message: "Subscription inactive. Please contact support.",
  });
}
