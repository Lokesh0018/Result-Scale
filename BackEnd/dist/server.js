"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const renderAdminRoutes_1 = require("./routes/renderAdminRoutes");
const railwayAdminRoutes_1 = require("./routes/railwayAdminRoutes");
const clientRoutes_1 = require("./routes/clientRoutes");
const studentRoutes_1 = require("./routes/studentRoutes");
const contactRoutes_1 = require("./routes/contactRoutes");
const app = (0, express_1.default)();
const serverType = (process.env.SERVER_TYPE || (process.env.IS_RAILWAY === "true" ? "railway" : "render")).toLowerCase();
process.env.SERVER_TYPE = serverType;
app.use((0, cors_1.default)({
    origin: [
        "https://resultscale.web.app",
        "http://localhost:5173",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
(0, db_1.default)();
const PORT = process.env.PORT || 3000;
app.use("/admin", serverType === "railway" ? railwayAdminRoutes_1.router : renderAdminRoutes_1.router);
app.use("/client", clientRoutes_1.router);
app.use("/student", studentRoutes_1.router);
app.use("/contact", contactRoutes_1.router);
app.listen(PORT, () => {
    console.log(`${serverType === "railway" ? "Railway" : "Render"} server running on port ${PORT}`);
});
