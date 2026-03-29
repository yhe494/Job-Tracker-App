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