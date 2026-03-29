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

/**
 * Zod schema for validating resume match request data.
 * 
 * @typedef {Object} ResumeMatchRequest
 * @property {string} resumeText - The resume text to be matched. Must be between 50 and 15000 characters (whitespace trimmed).
 * @property {string} jobDescription - The job description to match against. Must be between 50 and 15000 characters (whitespace trimmed).
 * 
 * @throws {ZodError} When resumeText or jobDescription is less than 50 characters or exceeds 15000 characters.
 */
export const resumeMatchRequestSchema = z.object({
  resumeText: z.string().trim().min(50, "Resume text is too short").max(15000),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description is too short")
    .max(15000),
});