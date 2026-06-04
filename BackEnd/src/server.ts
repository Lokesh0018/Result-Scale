import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import { router as adminRoutes } from "./routes/adminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";
import { router as contactRoutes } from "./routes/contactRoutes";

const app = express();

const allowedOrigins = [
    "https://resultscale.web.app",
    "https://resultscale.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:4173",
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin '${origin}' not allowed`));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

connectDB();

const PORT = process.env.PORT || 3000;
app.use("/admin", adminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/contact", contactRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
