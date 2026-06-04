import dotenv from "dotenv";

dotenv.config();

export type ServerType = "render" | "railway";

const normalizeServerType = (value?: string): ServerType => {
  const normalized = (value || "").toLowerCase();
  return normalized === "railway" ? "railway" : "render";
};

export const env = {
  serverType: normalizeServerType(process.env.SERVER_TYPE || (process.env.IS_RAILWAY === "true" ? "railway" : "render")),
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI || "",
  renderApiUrl: process.env.RENDER_API_URL || "http://localhost:3001",
  railwayApiUrl: process.env.RAILWAY_API_URL || "http://localhost:3000",
  corsOrigins: (process.env.CORS_ORIGINS || "https://resultscale.web.app,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

process.env.SERVER_TYPE = env.serverType;
