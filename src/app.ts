import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import menuRoutes from "./modules/menu/menu.routes";
import orderRoutes from "./modules/order/order.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);       
app.use("/api/orders", orderRoutes);
export default app;
