import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import menuRoutes from "./modules/menu/menu.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);

export default app;
