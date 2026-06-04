import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { env } from "./config/env";
import { router as renderAdminRoutes } from "./routes/renderAdminRoutes";
import { router as railwayAdminRoutes } from "./routes/railwayAdminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";
import { router as contactRoutes } from "./routes/contactRoutes";
import { router as activityLogRoutes } from "./routes/activityLogRoutes";
import { sendFailure } from "./utils/apiResponse";

const app = express();
const serverType = env.serverType;

app.use(cors({
  origin: env.corsOrigins,
  credentials: true,
}));
app.use(express.json());
connectDB();

app.use("/admin", serverType === "railway" ? railwayAdminRoutes : renderAdminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/contact", contactRoutes);
app.use("/activity-logs", activityLogRoutes);

app.use((req, res) => sendFailure(res, 404, "Route not found"));

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", err);
  return sendFailure(res, 500, "Internal Server Error", { message: err.message });
});

app.listen(env.port, () => {
  console.log(`${serverType === "railway" ? "Railway" : "Render"} server running on port ${env.port}`);
});
