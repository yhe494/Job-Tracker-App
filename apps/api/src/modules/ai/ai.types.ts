export interface ResumeMatchResult{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    summary: string;
}