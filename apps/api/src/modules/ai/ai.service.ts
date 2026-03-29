import OpenAI from "openai";
import {env} from "../../config/env";
import {ResumeMatchResult} from "./ai.types";

const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

/**
 * Generates a resume-to-job matching analysis by prompting an AI model and parsing its JSON output.
 *
 * The AI is instructed to return a strict JSON object containing:
 * - `matchScore` (0–100 integer)
 * - `matchedSkills`
 * - `missingSkills`
 * - `suggestions`
 * - `summary`
 *
 * @param resumeText - The candidate's resume content as plain text.
 * @param jobDescription - The target job description as plain text.
 * @returns A parsed {@link ResumeMatchResult} object representing the match analysis.
 * @throws {Error} Throws if the AI response cannot be parsed as valid JSON.
 */
export async function generateResumeJobMatch(
    resumeText: string,
    jobDescription: string
): Promise<ResumeMatchResult> {
    const prompt = `You are a resume-to-job matching assistant.

Compare the candidate resume and the job description.

Return ONLY valid JSON with this exact structure:
{
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "summary": string
}

Rules:
- matchScore must be an integer from 0 to 100
- matchedSkills should include skills clearly present in both the resume and the job description
- missingSkills should include important requirements from the job description that are not clearly shown in the resume
- suggestions should be specific and practical
- summary should be short and professional
- do not include markdown
- do not include extra explanation outside the JSON

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""
`;

    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
    });
    const text = response.output_text;
    try{
        return JSON.parse(text) as ResumeMatchResult;

    }catch{
        throw new Error("Failed to parse AI response");
    }
}