"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySelfDestruct = exports.selfDestructGadgetInitiate = exports.decommissionGadget = exports.updateGadget = exports.createGadget = exports.getGadgets = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const data_1 = require("../utils/data");
const customError_1 = require("../utils/customError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const successProbability = () => Math.floor(Math.random() * 100) + 1;
const usedCodenames = new Set();
const getRandomCodename = () => {
    if (usedCodenames.size >= data_1.adjectives.length * data_1.creatures.length) {
        throw new Error("No more unique codenames available");
    }
    let codename;
    do {
        const randomAdj = data_1.adjectives[Math.floor(Math.random() * data_1.adjectives.length)];
        const randomCreature = data_1.creatures[Math.floor(Math.random() * data_1.creatures.length)];
        codename = `The ${randomAdj} ${randomCreature}`;
    } while (usedCodenames.has(codename));
    usedCodenames.add(codename);
    return codename;
};
const getGadgets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        if (status && !Object.values(client_1.Status).includes(status)) {
            return next(new customError_1.CustomError("Status not found", 404));
        }
        const filter = status ? { where: { status: status } } : undefined;
        const gadgets = yield prisma_1.default.gadget.findMany(filter);
        const gadgetsWithProbability = gadgets.map((gadget) => (Object.assign(Object.assign({}, gadget), { missionSuccessProbability: `${successProbability()}` })));
        res.json(gadgetsWithProbability);
    }
    catch (error) {
        next(error);
    }
});
exports.getGadgets = getGadgets;
const createGadget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = getRandomCodename();
        const gadget = yield prisma_1.default.gadget.create({
            data: { name },
        });
        res.status(201).json(gadget);
    }
    catch (error) {
        next(error);
    }
});
exports.createGadget = createGadget;
const updateGadget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const gadget = yield prisma_1.default.gadget.update({
            where: { id },
            data,
        });
        res.json(gadget);
    }
    catch (error) {
        next(error);
    }
});
exports.updateGadget = updateGadget;
const decommissionGadget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existingGadget = yield prisma_1.default.gadget.findUnique({
            where: { id },
        });
        if ((existingGadget === null || existingGadget === void 0 ? void 0 : existingGadget.status) === "Decommissioned") {
            throw new customError_1.CustomError("Gadget is already Decommissioned", 400);
        }
        const gadget = yield prisma_1.default.gadget.update({
            where: { id },
            data: {
                status: "Decommissioned",
                decommissionedAt: new Date(),
            },
        });
        res.json(gadget);
    }
    catch (error) {
        next(error);
    }
});
exports.decommissionGadget = decommissionGadget;
const selfDestructGadgetInitiate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const gadget = yield prisma_1.default.gadget.findUnique({
            where: { id },
        });
        if (!gadget)
            throw new customError_1.CustomError("Gadget doesn't exist", 404);
        if (gadget.status === "Destroyed")
            throw new customError_1.CustomError("Gadget is already destroyed", 400);
        const confirmationCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
        const hashedCode = yield bcrypt_1.default.hash(confirmationCode, 10);
        yield prisma_1.default.selfDestruct.upsert({
            where: { gadgetId: id },
            update: { confirmationCode: hashedCode, initiatedAt: new Date() },
            create: { gadgetId: id, confirmationCode: hashedCode },
        });
        res.json({
            message: `Gadget self-destruct sequence initiated. Please enter the confirmation code you see on the screen`,
            confirmationCode,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.selfDestructGadgetInitiate = selfDestructGadgetInitiate;
const verifySelfDestruct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { confirmationCode } = req.body;
        const selfDestructEntry = yield prisma_1.default.selfDestruct.findUnique({
            where: { gadgetId: id },
        });
        if (!selfDestructEntry) {
            throw new customError_1.CustomError("Self-destruct sequence not initiated for this gadget", 404);
        }
        const isMatch = yield bcrypt_1.default.compare(confirmationCode, selfDestructEntry.confirmationCode);
        if (!isMatch) {
            throw new customError_1.CustomError("Confirmation code is incorrect", 400);
        }
        const updatedGadget = yield prisma_1.default.gadget.update({
            where: { id },
            data: { status: "Destroyed" },
        });
        yield prisma_1.default.selfDestruct.delete({
            where: { id: selfDestructEntry.id },
        });
        res.json({
            message: "Gadget successfully destroyed",
            gadget: updatedGadget,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.verifySelfDestruct = verifySelfDestruct;
