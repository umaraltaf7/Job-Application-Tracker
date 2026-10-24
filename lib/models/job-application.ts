import mongoose, { Schema, Document } from "mongoose";

export interface IJobMatchResult {
    matchScore: number;
    recommendation: "APPLY" | "MAYBE" | "SKIP";
    matchedSkills: string[];
    missingSkills: string[];
    experienceMatch: "Strong" | "Good" | "Weak";
    educationMatch: "Strong" | "Good" | "Weak";
    reason: string;
}

export interface IApplicationPreparation {
    whyYouMatch: string;
    skillsToHighlight: string[];
    missingSkills: string[];
    coverLetter: string;
    recruiterMessage: string;
    resumeSuggestions: string[];
}

export interface ITailoredResume {
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
    };
    summary: string;
    skills: string[];
    experience: {
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        description: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
    }[];
    projects: {
        name: string;
        technologies: string[];
        description: string[];
    }[];
    certifications: string[];
    languages: string[];
}

export interface IJobApplication extends Document {
    company: string;
    position: string;
    location?: string;
    status: string;
    columnId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId;
    userId: string;
    order?: number;
    notes?: string;
    salary?: number;
    jobUrl?: string;
    applicationDate?: Date;
    followUpDate?: Date;
    lastFollowUpDate?: Date;
    interviewDate?: Date;
    deadline?: Date;
    reminderEnabled?: boolean;
    followUpCount?: number;
    priority?: "Low" | "Medium" | "High";
    applicationSource?: "The Muse" | "Manual" | "Other";
    applicationMethod?: "Manual" | "External" | "Auto-Apply";
    tags?: string[];
    description?: string;
    summary?: string[];
    matchResult?: IJobMatchResult;
    applicationPreparation?: IApplicationPreparation;
    tailoredResume?: ITailoredResume;
    createdAt: Date;
    updatedAt: Date;
}

const JobMatchResultSchema = new Schema<IJobMatchResult>(
    {
        matchScore: { type: Number, required: true },
        recommendation: {
            type: String,
            enum: ["APPLY", "MAYBE", "SKIP"],
            required: true,
        },
        matchedSkills: {
            type: [String],
            default: [],
        },
        missingSkills: {
            type: [String],
            default: [],
        },
        experienceMatch: {
            type: String,
            enum: ["Strong", "Good", "Weak"],
            required: true,
        },
        educationMatch: {
            type: String,
            enum: ["Strong", "Good", "Weak"],
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const ApplicationPreparationSchema =
    new Schema<IApplicationPreparation>(
        {
            whyYouMatch: { type: String },
            skillsToHighlight: {
                type: [String],
                default: [],
            },
            missingSkills: {
                type: [String],
                default: [],
            },
            coverLetter: { type: String },
            recruiterMessage: { type: String },
            resumeSuggestions: {
                type: [String],
                default: [],
            },
        },
        { _id: false }
    );

const TailoredResumeSchema =
    new Schema<ITailoredResume>(
        {
            personalInfo: {
                name: { type: String, default: "" },
                email: { type: String, default: "" },
                phone: { type: String, default: "" },
                location: { type: String, default: "" },
                linkedin: { type: String, default: "" },
                github: { type: String, default: "" },
            },
            summary: {
                type: String,
                default: "",
            },
            skills: {
                type: [String],
                default: [],
            },
            experience: {
                type: [
                    {
                        company: String,
                        role: String,
                        startDate: String,
                        endDate: String,
                        description: [String],
                    },
                ],
                default: [],
            },
            education: {
                type: [
                    {
                        institution: String,
                        degree: String,
                        field: String,
                        startDate: String,
                        endDate: String,
                    },
                ],
                default: [],
            },
            projects: {
                type: [
                    {
                        name: String,
                        technologies: [String],
                        description: [String],
                    },
                ],
                default: [],
            },
            certifications: {
                type: [String],
                default: [],
            },
            languages: {
                type: [String],
                default: [],
            },
        },
        { _id: false }
    );

const JobApplicationSchema: Schema =
    new Schema<IJobApplication>(
        {
            company: {
                type: String,
                required: true,
            },
            position: {
                type: String,
                required: true,
            },
            location: {
                type: String,
            },
            status: {
                type: String,
                required: true,
            },
            columnId: {
                type: Schema.Types.ObjectId,
                ref: "Column",
                required: true,
                index: true,
            },
            boardId: {
                type: Schema.Types.ObjectId,
                ref: "Board",
                required: true,
                index: true,
            },
            userId: {
                type: String,
                required: true,
                index: true,
            },
            order: {
                type: Number,
            },
            notes: {
                type: String,
            },
            salary: {
                type: Number,
            },
            jobUrl: {
                type: String,
            },
            applicationDate: {
                type: Date,
            },
            followUpDate: { type: Date, index: true },
            lastFollowUpDate: { type: Date },
            interviewDate: { type: Date, index: true },
            deadline: { type: Date, index: true },
            reminderEnabled: { type: Boolean, default: true },
            followUpCount: { type: Number, default: 0 },
            priority: {
                type: String,
                enum: ["Low", "Medium", "High"],
                default: "Medium",
            },
            applicationSource: {
                type: String,
                enum: ["The Muse", "Manual", "Other"],
                default: "Manual",
            },
            applicationMethod: {
                type: String,
                enum: ["Manual", "External", "Auto-Apply"],
                default: "Manual",
            },
            tags: [
                {
                    type: String,
                },
            ],
            description: {
                type: String,
            },
            summary: [
                {
                    type: String,
                },
            ],
            matchResult: {
                type: JobMatchResultSchema,
            },
            applicationPreparation: {
                type: ApplicationPreparationSchema,
            },
            tailoredResume: {
                type: TailoredResumeSchema,
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.models.JobApplication ||
    mongoose.model<IJobApplication>(
        "JobApplication",
        JobApplicationSchema
    );
