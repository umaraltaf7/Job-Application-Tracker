export interface JobMatchResult {
    matchScore: number;

    recommendation:
        | "APPLY"
        | "MAYBE"
        | "SKIP";

    matchedSkills: string[];

    missingSkills: string[];

    experienceMatch:
        | "Strong"
        | "Good"
        | "Weak";

    educationMatch:
        | "Strong"
        | "Good"
        | "Weak";

    reason: string;
}

export interface JobApplication {
    _id: string;

    company: string;

    position: string;

    location?: string;

    status: string;

    notes?: string;

    salary?: number;

    jobUrl?: string;

    order: number;

    columnId?: string;

    boardId?: string;

    userId?: string;

    tags?: string[];

    description?: string;

    summary?: string[];

    // Application tracking
    applicationDate?: Date | string;

    followUpDate?: Date | string;

    lastFollowUpDate?: Date | string;

    interviewDate?: Date | string;

    deadline?: Date | string;

    reminderEnabled?: boolean;

    followUpCount?: number;

    // Application metadata
    priority?: "Low" | "Medium" | "High";

    applicationSource?:
        | "The Muse"
        | "Manual"
        | "Other";

    applicationMethod?:
        | "Manual"
        | "External"
        | "Auto-Apply";

    // AI matching result saved with the application
    matchResult?: JobMatchResult;
}

export interface Column {
    _id: string;

    name: string;

    order: number;

    jobapplications: JobApplication[];

    /*
     * Compatibility field.
     * The database currently uses "jobapplications".
     */
    jobApplications?: JobApplication[];
}

export interface Board {
    _id: string;

    name: string;

    columns: Column[];
}

export interface ApplicationPreparation {
    whyYouMatch: string;

    skillsToHighlight: string[];

    missingSkills: string[];

    coverLetter: string;

    recruiterMessage: string;

    resumeSuggestions: string[];
}