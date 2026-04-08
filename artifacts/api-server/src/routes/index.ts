import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./openai/conversations";
import quizRouter from "./openai/quiz";
import profileRouter from "./profile";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/openai/conversations", conversationsRouter);
router.use("/openai", quizRouter);
router.use("/profile", profileRouter);
router.use("/progress", progressRouter);

export default router;
