"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Client_1 = __importDefault(require("../models/Client"));
const Student_1 = __importDefault(require("../models/Student"));
const dropUnexpectedUniqueIndexes = async () => {
    const uniqueIndexesToKeep = {
        Client: new Set(["_id_", "email_1"]),
        Student: new Set(["_id_", "email_1", "clientEmail_1_rollNo_1"]),
    };
    const models = [Client_1.default, Student_1.default];
    for (const model of models) {
        try {
            const indexes = await model.collection.indexes();
            const allowedUniqueIndexes = uniqueIndexesToKeep[model.modelName] || new Set(["_id_"]);
            await Promise.all(indexes
                .filter((index) => index.unique && !allowedUniqueIndexes.has(index.name || ""))
                .map((index) => {
                console.warn(`Dropping stale unique index ${index.name} on ${model.collection.name}`);
                return model.collection.dropIndex(index.name);
            }));
        }
        catch (error) {
            console.error(`Failed to inspect/drop stale indexes for ${model.modelName}:`, error);
        }
    }
};
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        await dropUnexpectedUniqueIndexes();
        await Promise.all([Client_1.default.syncIndexes(), Student_1.default.syncIndexes()]);
        console.log("MongoDB Connected");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
    }
};
exports.default = connectDB;
