import {Router} from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {registerHandler, loginHandler, refreshHandler, logoutHandler, meHandler, changePasswordHandler, deleteAccountHandler, updateMeHandler} from "./auth.controller.js";
import{registerLimiter, loginLimiter, refreshLimiter} from "../../middleware/rateLimit.js";



const router = Router();

router.post("/register", registerLimiter, registerHandler);
router.post("/login", loginLimiter, loginHandler);
router.post("/refresh", refreshLimiter, refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, meHandler);
router.patch("/me", requireAuth, updateMeHandler);
router.patch("/password", requireAuth, changePasswordHandler);
router.delete("/me", requireAuth, deleteAccountHandler);

export default router;