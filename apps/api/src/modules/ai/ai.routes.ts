import { Router} from "express";
import { postResumeMatch } from "./ai.controller";

const router = Router();

router.post("/resume-match", postResumeMatch);

export default router;
