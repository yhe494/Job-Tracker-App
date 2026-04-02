import { Router} from "express";
import { postResumeMatch } from "./ai.controller.js";

const router = Router();

router.post("/resume-match", postResumeMatch);

export default router;
