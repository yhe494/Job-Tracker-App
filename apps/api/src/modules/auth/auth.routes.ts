import {Router} from "express";
import { requireAuth } from "../../middleware/requireAuth";
import {registerHandler, loginHandler, refreshHandler, logoutHandler, meHandler} from "./auth.controller";
const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, meHandler);

export default router;