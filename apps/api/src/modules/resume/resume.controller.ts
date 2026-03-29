import { Request, Response, NextFunction } from "express";
import { extractTextFromPdfBuffer } from "./resume.service";
import { generateResumeJobMatch } from "../ai/ai.service";

export async function uploadResume(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const extractedText = await extractTextFromPdfBuffer(req.file.buffer);

    return res.status(200).json({
      success: true,
      data: {
        extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Matches an uploaded resume against a job description.
 * 
 * @param req - Express request object containing the uploaded file and job description in the body
 * @param res - Express response object used to send the result back to the client
 * @param next - Express next function for error handling
 * 
 * @returns A promise that resolves when the response is sent. Returns a 200 status with extracted text
 * and match result on success, or a 400 status with error message on validation failure.
 * 
 * @throws Passes errors to the next middleware via the next function
 * 
 * @example
 * ```
 * POST /resume/match
 * Content-Type: multipart/form-data
 * 
 * Body:
 * - file: (PDF file)
 * - jobDescription: "Software Engineer role requiring TypeScript..."
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "extractedText": "...",
 *     "matchResult": {...}
 *   }
 * }
 * ```
 */
export async function matchUploadedResume(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const jobDescription = req.body.jobDescription;

    if (!jobDescription || typeof jobDescription !== "string") {
      return res.status(400).json({
        success: false,
        message: "jobDescription is required",
      });
    }

    const extractedText = await extractTextFromPdfBuffer(req.file.buffer);
    const matchResult = await generateResumeJobMatch(
      extractedText,
      jobDescription
    );

    return res.status(200).json({
      success: true,
      data: {
        extractedText,
        matchResult,
      },
    });
  } catch (error) {
    next(error);
  }
}