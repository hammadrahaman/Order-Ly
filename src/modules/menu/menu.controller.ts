import { Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * POST /api/menu/categories
 */
export async function createMenuCategory(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        restaurantId,
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create category",
    });
  }
}

/**
 * GET /api/menu/categories
 */
export async function getMenuCategories(
  req: AuthRequest,
  res: Response
) {
  try {
    const restaurantId = req.user!.restaurantId;

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
}

/**
 * POST /api/menu/items
 */
export async function createMenuItem(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const restaurantId = req.user.restaurantId;
    const { name, code, price, isVeg, categoryId } = req.body;

    if (!name || !code || !price || !categoryId) {
      return res.status(400).json({
        message: "name, code, price and categoryId are required",
      });
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        restaurantId,
        code: String(code),
      },
    });

    if (existingItem) {
      return res.status(409).json({
        message: "Menu item code already exists",
      });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        code: String(code),
        price: Number(price),
        isVeg: Boolean(isVeg),
        categoryId,
        restaurantId,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create menu item",
    });
  }
}

/**
 * GET /api/menu/items
 * Optional query: ?categoryId=
 */
export async function getMenuItems(
  req: AuthRequest,
  res: Response
) {
  try {
    const restaurantId = req.user!.restaurantId;
    const { categoryId } = req.query;

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        ...(categoryId && { categoryId: String(categoryId) }),
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch menu items",
    });
  }
}
