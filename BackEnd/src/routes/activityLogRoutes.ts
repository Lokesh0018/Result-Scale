import express from "express";
import { listActivityLogs, storeActivityLog } from "../controller/activityLogController";

export const router = express.Router();

router.get("/", listActivityLogs);
router.post("/internal", storeActivityLog);
