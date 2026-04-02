import { Router } from "express";
import multer from "multer";
import { uploadResume, matchUploadedResume } from "./resume.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { resumeLimiter } from "../../middleware/rateLimit.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});
router.use(requireAuth);
router.post("/extract-text", resumeLimiter, upload.single("resume"), uploadResume);
router.post("/match", resumeLimiter, upload.single("resume"), matchUploadedResume);

export default router;