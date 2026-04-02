import { Router} from "express";
import { postResumeMatch } from "./ai.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import{aiLimiter} from "../../middleware/rateLimit.js";

const router = Router();

router.post("/resume-match", aiLimiter, requireAuth, postResumeMatch);

export default router;
