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
  
      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Category name is required",
        });
      }
  
      const trimmedName = name.trim();
  
      // 🔍 CHECK IF CATEGORY ALREADY EXISTS (CASE-INSENSITIVE)
      const existingCategory = await prisma.menuCategory.findFirst({
        where: {
          restaurantId,
          name: {
            equals: trimmedName,
            mode: "insensitive",
          },
        },
      });
  
      if (existingCategory) {
        return res.status(409).json({
          message: "Category already exists",
        });
      }
  
      const category = await prisma.menuCategory.create({
        data: {
          name: trimmedName,
          restaurantId,
        },
      });
  
      return res.status(201).json(category);
    } catch (error) {
      console.error("Create menu category error:", error);
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






/**
 * PUT /api/menu/items/:itemId/status
 */
export const updateMenuItemStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { itemId } = req.params;
    const { isActive } = req.body;
    const restaurantId = req.user!.restaurantId;

    // 1️⃣ Validate body
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean"
      });
    }

    // 2️⃣ Ensure item belongs to restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    // 3️⃣ Update status
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isActive }
    });

    return res.json({
      message: "Menu item status updated successfully"
    });
  } catch (error) {
    console.error("Update menu item status error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
