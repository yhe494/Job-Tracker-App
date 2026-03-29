import {Request, Response, NextFunction} from 'express';
import { generateResumeJobMatch } from './ai.service';


/**
 * Handles POST request to match a resume against a job description.
 * 
 * @param req - Express request object containing resumeText and jobDescription in the body
 * @param req.body.resumeText - The text content of the resume
 * @param req.body.jobDescription - The text content of the job description
 * @param res - Express response object
 * @param next - Express next function for error handling
 * 
 * @returns {Promise<void>} Returns a JSON response with match results or error message
 * 
 * @throws {Error} Passes errors to the next middleware via next(error)
 * 
 * @example
 * POST /api/resume-match
 * {
 *   "resumeText": "...",
 *   "jobDescription": "..."
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "resumeText and jobDescription are required"
 * }
 */
export async function postResumeMatch(req: Request, res: Response, next: NextFunction) {
    try{
        const { resumeText, jobDescription } = req.body;
        if(!resumeText || !jobDescription){
            return res.status(400).json({
                success:false,
                message: "resumeText and jobDescription are required",
            });
            
        }
        const result = await generateResumeJobMatch(resumeText, jobDescription);

        return res.status(200).json({
            success: true,
            data: result,
        });
    }catch(error){
        next(error);
    }
    
    }