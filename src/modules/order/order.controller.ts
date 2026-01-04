import { Response } from "express";
import prisma from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const createOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { orderType, tableNumber } = req.body;
    const restaurantId = req.user!.restaurantId;

    // 1️⃣ Validate orderType
    if (!orderType || !["DINE_IN", "TAKEAWAY"].includes(orderType)) {
      return res.status(400).json({
        message: "Invalid orderType. Must be DINE_IN or TAKEAWAY"
      });
    }

    // 2️⃣ Validate tableNumber for DINE_IN
    if (orderType === "DINE_IN") {
      if (typeof tableNumber !== "number") {
        return res.status(400).json({
          message: "tableNumber is required for DINE_IN orders"
        });
      }

      // Optional but recommended:
      // prevent multiple OPEN orders for same table
      const existingOrder = await prisma.order.findFirst({
        where: {
          restaurantId,
          tableNumber,
          status: "OPEN"
        }
      });

      if (existingOrder) {
        return res.status(409).json({
          message: "An open order already exists for this table",
          orderId: existingOrder.id
        });
      }
    }

    // 3️⃣ Create order
    const order = await prisma.order.create({
      data: {
        restaurantId,
        orderType,
        tableNumber: orderType === "DINE_IN" ? tableNumber : null,
        status: "OPEN",
        subTotal: 0,
        tax: 0,
        discount: 0,
        total: 0
      }
    });

    return res.status(201).json({
      id: order.id,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      status: order.status
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
