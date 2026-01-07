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





export async function addItemToOrder(
  req: AuthRequest,
  res: Response
) {
  try {
    const { orderId } = req.params;
    const { code, quantity = 1 } = req.body;
    const restaurantId = req.user!.restaurantId;

    // 1️⃣ Validate input
    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Menu item code is required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // 2️⃣ Find OPEN order + restaurant (for GST)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        status: "OPEN",
      },
      include: {
        restaurant: true, // 👈 GST comes from here
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or already closed",
      });
    }

    // 3️⃣ Find menu item by CODE (restaurant-scoped)
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        restaurantId,
        code,
        isActive: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found or inactive",
      });
    }

    // 4️⃣ Check if item already exists in cart
    const existingOrderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        itemId: menuItem.id,
      },
    });

    if (existingOrderItem) {
      // Increment quantity
      await prisma.orderItem.update({
        where: { id: existingOrderItem.id },
        data: {
          quantity: existingOrderItem.quantity + quantity,
        },
      });
    } else {
      // Create new cart item (price snapshot)
      await prisma.orderItem.create({
        data: {
          orderId,
          itemId: menuItem.id,
          quantity,
          price: menuItem.price,
        },
      });
    }

    // 5️⃣ Fetch all order items for recalculation
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        item: true,
      },
    });

    // 6️⃣ Recalculate totals
    const subTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const gstPercentage = order.restaurant.gstPercentage; // 👈 restaurant-defined
    const tax =
      Math.round((subTotal * gstPercentage / 100) * 100) / 100;

    const discount = 0;
    const total =
      Math.round((subTotal + tax - discount) * 100) / 100;

    // 7️⃣ Update order totals
    await prisma.order.update({
      where: { id: orderId },
      data: {
        subTotal,
        tax,
        discount,
        total,
      },
    });

    // 8️⃣ Response
    return res.json({
      orderId,
      items: orderItems.map((i) => ({
        orderItemId: i.id,      // 👈 THIS IS WHAT YOU NEED
        name: i.item.name,
        code: i.item.code,
        quantity: i.quantity,
        price: i.price,
        lineTotal: i.price * i.quantity,
      })),
      subTotal,
      gstPercentage,
      tax,
      discount,
      total,
    });

  } catch (error) {
    console.error("Add item to order error:", error);
    return res.status(500).json({
      message: "Failed to add item to order",
    });
  }




  
}



export async function updateOrderItemQuantity(
  req: AuthRequest,
  res: Response
) {
  try {
    const { orderId, orderItemId } = req.params;
    const { quantity } = req.body;
    const restaurantId = req.user!.restaurantId;

    if (quantity == null || quantity < 0) {
      return res.status(400).json({
        message: "Quantity must be 0 or greater",
      });
    }

    // 1️⃣ Find order with restaurant (for GST)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        status: "OPEN",
      },
      include: {
        restaurant: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or already closed",
      });
    }

    // 2️⃣ Find order item
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
      },
    });

    if (!orderItem) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    // 3️⃣ Update or delete item
    if (quantity === 0) {
      await prisma.orderItem.delete({
        where: { id: orderItemId },
      });
    } else {
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { quantity },
      });
    }

    // 4️⃣ Recalculate totals
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const subTotal = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const gstPercentage = order.restaurant.gstPercentage;
    const tax =
      Math.round((subTotal * gstPercentage / 100) * 100) / 100;

    const discount = 0;
    const total =
      Math.round((subTotal + tax - discount) * 100) / 100;

    await prisma.order.update({
      where: { id: orderId },
      data: { subTotal, tax, discount, total },
    });

    return res.json({
      orderId,
      subTotal,
      tax,
      discount,
      total,
    });
  } catch (error) {
    console.error("Update order item quantity error:", error);
    return res.status(500).json({
      message: "Failed to update item quantity",
    });
  }
}




export async function removeOrderItem(
  req: AuthRequest,
  res: Response
) {
  try {
    const { orderId, orderItemId } = req.params;
    const restaurantId = req.user!.restaurantId;

    // 1️⃣ Find order + restaurant (for GST)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        status: "OPEN",
      },
      include: {
        restaurant: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or already closed",
      });
    }

    // 2️⃣ Find order item
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
      },
    });

    if (!orderItem) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    // 3️⃣ Delete item
    await prisma.orderItem.delete({
      where: { id: orderItemId },
      });

    // 4️⃣ Recalculate totals
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const subTotal = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const gstPercentage = order.restaurant.gstPercentage;
    const tax =
      Math.round((subTotal * gstPercentage / 100) * 100) / 100;

    const discount = 0;
    const total =
      Math.round((subTotal + tax - discount) * 100) / 100;

    await prisma.order.update({
      where: { id: orderId },
      data: { subTotal, tax, discount, total },
    });

    return res.json({
      orderId,
      subTotal,
      tax,
      discount,
      total,
    });

  } catch (error) {
    console.error("Remove order item error:", error);
    return res.status(500).json({
      message: "Failed to remove item from order",
    });
  }
}





export async function payForOrder(
  req: AuthRequest,
  res: Response
) {
  try {
    const { orderId } = req.params;
    const { method } = req.body;
    const restaurantId = req.user!.restaurantId;

    // 1️⃣ Validate payment method
    if (!method || !["CASH", "UPI"].includes(method)) {
      return res.status(400).json({
        message: "Invalid payment method. Use CASH or UPI",
      });
    }

    // 2️⃣ Find order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 3️⃣ Ensure order is OPEN
    if (order.status !== "OPEN") {
      return res.status(409).json({
        message: "Order is already paid or cancelled",
      });
    }

    // 4️⃣ Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        restaurantId,
        amount: order.total,
        method,
        status: "SUCCESS",
      },
    });

    // 5️⃣ Update order status → PAID
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    // 6️⃣ Response
    return res.json({
      orderId,
      status: "PAID",
      payment: {
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
      },
    });

  } catch (error) {
    console.error("Pay order error:", error);
    return res.status(500).json({
      message: "Failed to process payment",
    });
  }
}
