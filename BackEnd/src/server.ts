import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import { router as adminRoutes } from "./routes/adminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});