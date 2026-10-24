import mongoose, { Schema, Document } from "mongoose";

export interface IResumeExperience {
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string[];
}

export interface IResumeEducation {
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface IResumeProject {
  name: string;
  technologies: string[];
  description: string[];
}

export interface IResumeParsedData {
  personalInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
  };

  summary: string | null;

  skills: string[];

  experience: IResumeExperience[];

  education: IResumeEducation[];

  projects: IResumeProject[];

  certifications: string[];

  languages: string[];
}

export interface IResume extends Document {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  isDefault: boolean;

  extractedText?: string;

  parsedData?: IResumeParsedData;

  parseStatus?: "pending" | "processing" | "completed" | "failed";

  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema<IResume>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    storagePath: {
      type: String,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    extractedText: {
      type: String,
    },

    parseStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    parsedData: {
      personalInfo: {
        name: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        location: { type: String, default: null },
        linkedin: { type: String, default: null },
        github: { type: String, default: null },
      },

      summary: {
        type: String,
        default: null,
      },

      skills: {
        type: [String],
        default: [],
      },

      experience: [
        {
          company: { type: String, required: true },
          role: { type: String, required: true },
          startDate: { type: String, default: null },
          endDate: { type: String, default: null },
          description: {
            type: [String],
            default: [],
          },
        },
      ],

      education: [
        {
          institution: { type: String, required: true },
          degree: { type: String, required: true },
          field: { type: String, default: null },
          startDate: { type: String, default: null },
          endDate: { type: String, default: null },
        },
      ],

      projects: [
        {
          name: { type: String, required: true },
          technologies: {
            type: [String],
            default: [],
          },
          description: {
            type: [String],
            default: [],
          },
        },
      ],

      certifications: {
        type: [String],
        default: [],
      },

      languages: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);