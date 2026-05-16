import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
    try {
        dotenv.config();
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;