"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gadgetController_1 = require("../controllers/gadgetController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.get("/", gadgetController_1.getGadgets);
router.post("/", gadgetController_1.createGadget);
router.patch("/:id", gadgetController_1.updateGadget);
router.delete("/:id", gadgetController_1.decommissionGadget);
router.post("/:id/self-destruct", gadgetController_1.selfDestructGadgetInitiate);
router.post("/:id/self-destruct-verify", gadgetController_1.verifySelfDestruct);
exports.default = router;
