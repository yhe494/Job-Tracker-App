import { Router } from "express";
import multer from "multer";
import { uploadResume, matchUploadedResume } from "./resume.controller.js";

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

router.post("/extract-text", upload.single("resume"), uploadResume);
router.post("/match", upload.single("resume"), matchUploadedResume);

export default router;