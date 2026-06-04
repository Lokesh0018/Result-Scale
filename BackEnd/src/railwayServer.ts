process.env.SERVER_TYPE = "railway";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import { router as railwayAdminRoutes } from "./routes/railwayAdminRoutes";
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
app.use("/admin", railwayAdminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`Railway Server running on port ${PORT}`);
});
