import {Router} from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {registerHandler, loginHandler, refreshHandler, logoutHandler, meHandler, changePasswordHandler, deleteAccountHandler, updateMeHandler} from "./auth.controller.js";
const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, meHandler);
router.patch("/me", requireAuth, updateMeHandler);
router.patch("/password", requireAuth, changePasswordHandler);
router.delete("/me", requireAuth, deleteAccountHandler);

export default router;