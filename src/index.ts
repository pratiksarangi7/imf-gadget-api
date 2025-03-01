import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import gadgetRoutes from "./routes/gadgetRoutes";
import authRoutes from "./routes/authRoutes";
import "./utils/cron-job";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/gadgets", gadgetRoutes);
app.use("/auth", authRoutes);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
