import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiToolsRouter from "./ai-tools";
import openaiConversationsRouter from "./openai-conversations";
import paystackRouter from "./paystack";
import imageRouter from "./image";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(aiToolsRouter);
router.use(openaiConversationsRouter);
router.use(paystackRouter);
router.use(imageRouter);

export default router;
