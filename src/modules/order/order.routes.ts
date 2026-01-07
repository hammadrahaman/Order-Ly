import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { subscriptionMiddleware } from "../../middlewares/subscription.middleware";
import { addItemToOrder, createOrder, payForOrder, removeOrderItem, updateOrderItemQuantity } from "./order.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  subscriptionMiddleware,
  createOrder
);

router.post(
  "/:orderId/items",
  authMiddleware,
  subscriptionMiddleware,
  addItemToOrder
);

router.patch(
  "/:orderId/items/:itemId/quantity",
  authMiddleware,
  subscriptionMiddleware,
  updateOrderItemQuantity
);


router.patch(
  "/:orderId/items/:orderItemId",
  authMiddleware,
  subscriptionMiddleware,
  updateOrderItemQuantity
);

router.delete(
  "/:orderId/items/:orderItemId",
  authMiddleware,
  subscriptionMiddleware,
  removeOrderItem
);

router.post(
  "/:orderId/payments",
  authMiddleware,
  subscriptionMiddleware,
  payForOrder
);

export default router;
