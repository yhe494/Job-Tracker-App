import {z} from "zod";

/**
 * Schema for resume matching response validation.
 * Defines the structure of the response returned when matching a resume against job requirements.
 * 
 * @property {number} matchScore - The match percentage between resume and job requirements (0-100).
 * @property {string[]} matchedSkills - Array of skills found in both resume and job requirements.
 * @property {string[]} missingSkills - Array of required skills not found in the resume.
 * @property {string[]} suggestions - Array of improvement suggestions for the resume.
 * @property {string} summary - A brief text summary of the match analysis.
 */
export const resumeMatchResponseSchema = z.object({
    matchScore:z.number().min(0).max(100),
    matchedSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    suggestions: z.array(z.string()),
    summary: z.string(),
})