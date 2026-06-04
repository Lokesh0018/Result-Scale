"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = require("./config/env");
const renderAdminRoutes_1 = require("./routes/renderAdminRoutes");
const railwayAdminRoutes_1 = require("./routes/railwayAdminRoutes");
const clientRoutes_1 = require("./routes/clientRoutes");
const studentRoutes_1 = require("./routes/studentRoutes");
const contactRoutes_1 = require("./routes/contactRoutes");
const activityLogRoutes_1 = require("./routes/activityLogRoutes");
const apiResponse_1 = require("./utils/apiResponse");
const app = (0, express_1.default)();
const serverType = env_1.env.serverType;
app.use((0, cors_1.default)({
    origin: env_1.env.corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
(0, db_1.default)();
app.use("/admin", serverType === "railway" ? railwayAdminRoutes_1.router : renderAdminRoutes_1.router);
app.use("/client", clientRoutes_1.router);
app.use("/student", studentRoutes_1.router);
app.use("/contact", contactRoutes_1.router);
app.use("/activity-logs", activityLogRoutes_1.router);
app.use((req, res) => (0, apiResponse_1.sendFailure)(res, 404, "Route not found"));
app.use((err, req, res, _next) => {
    console.error("Unhandled API error:", err);
    return (0, apiResponse_1.sendFailure)(res, 500, "Internal Server Error", { message: err.message });
});
app.listen(env_1.env.port, () => {
    console.log(`${serverType === "railway" ? "Railway" : "Render"} server running on port ${env_1.env.port}`);
});
