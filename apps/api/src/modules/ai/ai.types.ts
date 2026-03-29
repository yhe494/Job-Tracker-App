export interface ResumeMatchResult{
    matchScore: number;
    matchSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    summary: string;
}