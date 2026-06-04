import mongoose from "mongoose";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES): Promise<void> => {
    if (!process.env.MONGO_URI) {
        console.error("FATAL: MONGO_URI environment variable is not set.");
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB Connected");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
            setTimeout(() => connectDB(MAX_RETRIES), RETRY_DELAY_MS);
        });

    } catch (error) {
        console.error(`MongoDB connection failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
        if (retries > 1) {
            console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
            return connectDB(retries - 1);
        } else {
            console.error("FATAL: Could not connect to MongoDB after maximum retries. Exiting.");
            process.exit(1);
        }
    }
};

export default connectDB;
