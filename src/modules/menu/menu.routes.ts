import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { subscriptionMiddleware } from "../../middlewares/subscription.middleware";
import {
    createMenuCategory,
    getMenuCategories,
    createMenuItem,
    getMenuItems,
    updateMenuItemStatus,
  } from "./menu.controller";
  
const router = Router();

router.use(authMiddleware);
router.use(subscriptionMiddleware);

router.post("/categories", createMenuCategory);
router.get("/categories", getMenuCategories);
router.post("/items", createMenuItem);
router.get("/items", getMenuItems);
router.patch("/items/:itemId/status", updateMenuItemStatus);
export default router;
