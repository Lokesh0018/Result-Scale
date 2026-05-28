import express from "express";
import dotenv from "dotenv";
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.local",
});
import cors from "cors";
import connectDB from "./config/db";
import { router as adminRoutes } from "./routes/adminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";
import { router as contactRoutes } from "./routes/contactRoutes";

const app = express();
app.use(cors({
  origin: [
    "https://resultscale.web.app",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());
connectDB();

const PORT = process.env.PORT || 3000;
app.use("/admin", adminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});