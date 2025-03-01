import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prismaClient from "../utils/prisma";
import bcrypt from "bcrypt";
import { CustomError } from "../utils/customError";
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json({ userId: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new CustomError("Invalid Credentials", 401));
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
