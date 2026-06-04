import { Request, Response } from "express";
import { StoreActivityLog, GetActivityLogs } from "../service/logService";
import { env } from "../config/env";
import { sendFailure, sendSuccess } from "../utils/apiResponse";

export const storeActivityLog = async (req: Request, res: Response) => {
  try {
    if (env.serverType !== "railway") {
      return sendFailure(res, 400, "Activity logs must be stored through the Railway API");
    }

    const { userEmail, userRole, action, category, details, status } = req.body;
    if (!userEmail || !userRole || !action || !category || !status) {
      return sendFailure(res, 400, "userEmail, userRole, action, category and status are required");
    }

    const log = await StoreActivityLog(userEmail, userRole, action, category, details || "", status);
    return sendSuccess(res, 201, "Activity log stored successfully", { log });
  } catch (err: any) {
    return sendFailure(res, 500, err.message, { message: err.message });
  }
};

export const listActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await GetActivityLogs();
    return sendSuccess(res, 200, "Activity logs fetched successfully", { logs });
  } catch (err: any) {
    return sendFailure(res, 500, err.message, { message: err.message });
  }
};
