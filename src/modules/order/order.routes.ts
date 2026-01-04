import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { subscriptionMiddleware } from "../../middlewares/subscription.middleware";
import { createOrder } from "./order.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  subscriptionMiddleware,
  createOrder
);

export default router;
