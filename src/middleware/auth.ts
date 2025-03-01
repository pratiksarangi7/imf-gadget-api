import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/customError";

interface JwtPayload {
  userId: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new CustomError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    (req as any).userId = decoded.userId;
    next();
  } catch (err) {
    return next(new CustomError("Invalid token", 401));
  }
};

export default authMiddleware;
