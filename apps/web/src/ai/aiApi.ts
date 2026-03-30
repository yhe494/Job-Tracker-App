
import { api } from "../lib/api";

export interface ResumeMatchRequest {
    resumeText: string;
    jobDescription: string;
}

export interface ResumeMatchResult {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    summary: string;
}

export interface ResumeMatchResponse {
    success: boolean;
    data: ResumeMatchResult;
}

/**
 * Sends resume-to-job matching input to the AI endpoint and returns the computed match result.
 *
 * @param payload - The resume matching request payload containing the data required by the backend.
 * @returns A promise that resolves to the resume match response data.
 */
export async function postResumeMatch(payload: ResumeMatchRequest) {
    return api<ResumeMatchResponse>("/api/v1/ai/resume-match", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

/**
 * Response object for resume matching operations that include file processing.
 * @interface ResumeMatchWithFileResponse
 * @property {boolean} success - Indicates whether the resume matching operation completed successfully.
 * @property {Object} data - Container object for the matching results and extracted content.
 * @property {string} data.extractedText - The raw text extracted from the resume file.
 * @property {ResumeMatchResult} data.matchResult - The result of matching the resume against job requirements.
 */
export interface ResumeMatchWithFileResponse{
    success: boolean;
    data: {
        extractedText: string;
        matchResult: ResumeMatchResult;
    };
}

/**
 * Matches a resume against a job description.
 * @param file - The resume file to be matched
 * @param jobDescription - The job description to match against
 * @returns A promise that resolves to the resume match response
 */
export async function postResumeMatchWithFile(file:File, jobDescription:string){
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    return api<ResumeMatchWithFileResponse>("/api/v1/resume/match", {
        method: "POST",
        body: formData,
    });
}

