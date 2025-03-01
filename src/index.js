"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const gadgetRoutes_1 = __importDefault(require("./routes/gadgetRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
require("./utils/cron-job");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use("/gadgets", gadgetRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.use((err, req, res, next) => {
    console.error(err);
    res
        .status(err.status || 500)
        .json({ error: err.message || "Internal Server Error" });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
