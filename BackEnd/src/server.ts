import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import { router as renderAdminRoutes } from "./routes/renderAdminRoutes";
import { router as railwayAdminRoutes } from "./routes/railwayAdminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";
import { router as contactRoutes } from "./routes/contactRoutes";

const app = express();
const serverType = (process.env.SERVER_TYPE || (process.env.IS_RAILWAY === "true" ? "railway" : "render")).toLowerCase();
process.env.SERVER_TYPE = serverType;

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
app.use("/admin", serverType === "railway" ? railwayAdminRoutes : renderAdminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/contact", contactRoutes);

app.listen(PORT, () => {
  console.log(`${serverType === "railway" ? "Railway" : "Render"} server running on port ${PORT}`);
});
