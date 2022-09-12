import { Router } from "express";
import authRouter from "./authRouter.js";
import spentRouter from "./spentRouter.js";

const router = Router();
router.use(authRouter);
router.use(spentRouter);

export default router;