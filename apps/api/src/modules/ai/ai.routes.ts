import { Router} from "express";
import { postResumeMatch } from "./ai.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

router.post("/resume-match", requireAuth, postResumeMatch);

export default router;
