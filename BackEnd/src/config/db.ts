import mongoose from "mongoose";
import Client from "../models/Client";
import Student from "../models/Student";
import ActivityLog from "../models/ActivityLog";
import { env } from "./env";

const dropUnexpectedUniqueIndexes = async () => {
    const uniqueIndexesToKeep: Record<string, Set<string>> = {
        Client: new Set(["_id_", "email_1"]),
        Student: new Set(["_id_", "email_1", "clientEmail_1_rollNo_1"]),
    };

    const models = [Client, Student];

    for (const model of models) {
        try {
            const indexes = await model.collection.indexes();
            const allowedUniqueIndexes = uniqueIndexesToKeep[model.modelName] || new Set(["_id_"]);

            await Promise.all(
                indexes
                    .filter((index) => index.unique && !allowedUniqueIndexes.has(index.name || ""))
                    .map((index) => {
                        console.warn(`Dropping stale unique index ${index.name} on ${model.collection.name}`);
                        return model.collection.dropIndex(index.name as string);
                    })
            );
        } catch (error) {
            console.error(`Failed to inspect/drop stale indexes for ${model.modelName}:`, error);
        }
    }
};

const connectDB = async () => {
    try {
        if (!env.mongoUri) {
            throw new Error("MONGO_URI is not configured");
        }

        await mongoose.connect(env.mongoUri);
        await dropUnexpectedUniqueIndexes();
        await Promise.all([Client.syncIndexes(), Student.syncIndexes(), ActivityLog.syncIndexes()]);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
};

export default connectDB;
