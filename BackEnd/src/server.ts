import express from "express";
//import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { router as adminRoutes } from "./routes/adminRoutes";
import { router as clientRoutes } from "./routes/clientRoutes";
import { router as studentRoutes } from "./routes/studentRoutes";

const app = express();

//app.use(cors());
app.use(express.json());
connectDB();
dotenv.config();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

app.use("/admin",adminRoutes);
app.use("/client",clientRoutes);
app.use("/student",studentRoutes);