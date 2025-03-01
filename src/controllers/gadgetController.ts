import { Status } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import prismaClient from "../utils/prisma";
import { adjectives, creatures } from "../utils/data";
import { CustomError } from "../utils/customError";
import bcrypt from "bcrypt";
const successProbability = (): number => Math.floor(Math.random() * 100) + 1;

const usedCodenames = new Set<String>();
const getRandomCodename = (): string => {
  if (usedCodenames.size >= adjectives.length * creatures.length) {
    throw new Error("No more unique codenames available");
  }

  let codename;
  do {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomCreature =
      creatures[Math.floor(Math.random() * creatures.length)];
    codename = `The ${randomAdj} ${randomCreature}`;
  } while (usedCodenames.has(codename));

  usedCodenames.add(codename);
  return codename;
};

export const getGadgets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    if (status && !Object.values(Status).includes(status as Status)) {
      return next(new CustomError("Status not found", 404));
    }
    const filter = status ? { where: { status: status as Status } } : undefined;
    const gadgets = await prismaClient.gadget.findMany(filter);
    const gadgetsWithProbability = gadgets.map((gadget) => ({
      ...gadget,
      missionSuccessProbability: `${successProbability()}`,
    }));
    res.json(gadgetsWithProbability);
  } catch (error) {
    next(error);
  }
};

export const createGadget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = getRandomCodename();
    const gadget = await prismaClient.gadget.create({
      data: { name },
    });
    res.status(201).json(gadget);
  } catch (error) {
    next(error);
  }
};

export const updateGadget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const gadget = await prismaClient.gadget.update({
      where: { id },
      data,
    });
    res.json(gadget);
  } catch (error) {
    next(error);
  }
};

export const decommissionGadget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existingGadget = await prismaClient.gadget.findUnique({
      where: { id },
    });
    if (existingGadget?.status === "Decommissioned") {
      throw new CustomError("Gadget is already Decommissioned", 400);
    }
    const gadget = await prismaClient.gadget.update({
      where: { id },
      data: {
        status: "Decommissioned",
        decommissionedAt: new Date(),
      },
    });
    res.json(gadget);
  } catch (error) {
    next(error);
  }
};
export const selfDestructGadgetInitiate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const gadget = await prismaClient.gadget.findUnique({
      where: { id },
    });
    if (!gadget) throw new CustomError("Gadget doesn't exist", 404);
    if (gadget.status === "Destroyed")
      throw new CustomError("Gadget is already destroyed", 400);
    const confirmationCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const hashedCode = await bcrypt.hash(confirmationCode, 10);
    await prismaClient.selfDestruct.upsert({
      where: { gadgetId: id },
      update: { confirmationCode: hashedCode, initiatedAt: new Date() },
      create: { gadgetId: id, confirmationCode: hashedCode },
    });

    res.json({
      message: `Gadget self-destruct sequence initiated. Please enter the confirmation code you see on the screen`,
      confirmationCode,
    });
  } catch (error) {
    next(error);
  }
};

export const verifySelfDestruct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;

    const selfDestructEntry = await prismaClient.selfDestruct.findUnique({
      where: { gadgetId: id },
    });
    if (!selfDestructEntry) {
      throw new CustomError(
        "Self-destruct sequence not initiated for this gadget",
        404
      );
    }
    const isMatch = await bcrypt.compare(
      confirmationCode,
      selfDestructEntry.confirmationCode
    );
    if (!isMatch) {
      throw new CustomError("Confirmation code is incorrect", 400);
    }
    const updatedGadget = await prismaClient.gadget.update({
      where: { id },
      data: { status: "Destroyed" },
    });
    await prismaClient.selfDestruct.delete({
      where: { id: selfDestructEntry.id },
    });

    res.json({
      message: "Gadget successfully destroyed",
      gadget: updatedGadget,
    });
    return;
  } catch (error) {
    next(error);
  }
};
