import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import connectDB from "./config/db";
import { router as adminRoutes } from "./routes/adminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";
import { router as csvRoutes } from "./routes/csvRoutes";
import { router as studentAuthRoutes } from "./routes/studentAuthRoutes";
import { router as analyticsRoutes } from "./routes/analyticsRoutes";
import { AnalyticsService } from "./service/analyticsService";

const app = express();
const httpServer = createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
connectDB();

const PORT = process.env.PORT;

// Routes
app.use("/admin", adminRoutes);
app.use("/client", clientRoutes);
app.use("/student", studentRoutes);
app.use("/csv", csvRoutes);
app.use("/student-auth", studentAuthRoutes);
app.use("/analytics", analyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  AnalyticsService.addActiveConnection(socket.id);

  // Send real-time metrics every 2 seconds
  const metricsInterval = setInterval(async () => {
    try {
      const metrics = await AnalyticsService.getInfraMetrics();
      const institutions = await AnalyticsService.getInstitutionMetrics();
      const latency = AnalyticsService.getAPILatencyMetrics();
      const events = AnalyticsService.getLiveEvents(10);

      socket.emit('metrics-update', {
        metrics,
        institutions,
        latency,
        events
      });
    } catch (error) {
      console.error('Error sending metrics:', error);
    }
  }, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    AnalyticsService.removeActiveConnection(socket.id);
    clearInterval(metricsInterval);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time updates`);
  console.log(`Uploads directory: ${uploadsDir}`);
});