import {Request, Response, NextFunction} from 'express';
import { generateResumeJobMatch } from './ai.service';
import { resumeMatchRequestSchema } from './ai.schema';



/**
 * Handles POST request to match a resume against a job description.
 * Validates the request body, generates a match analysis between the resume text
 * and job description, and returns the result.
 *
 * @param req - Express request object containing resumeText and jobDescription in body
 * @param res - Express response object used to send the JSON response
 * @param next - Express next function for error handling middleware
 * @returns Promise<void> - Sends JSON response with success status and match data, or passes error to next middleware
 *
 * @throws Passes validation errors and processing errors to next middleware
 *
 * @example
 * // Request body:
 * // {
 * //   "resumeText": "...",
 * //   "jobDescription": "..."
 * // }
 * //
 * // Response:
 * // {
 * //   "success": true,
 * //   "data": { ... }
 * // }
 */
export async function postResumeMatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { resumeText, jobDescription } = resumeMatchRequestSchema.parse(
      req.body
    );

    const result = await generateResumeJobMatch(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}