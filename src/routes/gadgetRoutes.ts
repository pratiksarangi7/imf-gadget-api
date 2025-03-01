import { Router } from "express";
import {
  getGadgets,
  createGadget,
  updateGadget,
  decommissionGadget,
  selfDestructGadgetInitiate,
  verifySelfDestruct,
} from "../controllers/gadgetController";
import authMiddleware from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getGadgets);
router.post("/", createGadget);
router.patch("/:id", updateGadget);
router.delete("/:id", decommissionGadget);
router.post("/:id/self-destruct", selfDestructGadgetInitiate);
router.post("/:id/self-destruct-verify", verifySelfDestruct);

export default router;
