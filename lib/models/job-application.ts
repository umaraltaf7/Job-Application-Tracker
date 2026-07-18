

import mongoose, { Schema,  Document } from "mongoose";

export interface IJobApplication extends Document {
    company: string;
    position: string;
    location?: string;
    status: string;
    columnId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId;
    userId:string;
    order?: number;
    notes?: string;
    salary?: number;
    jobUrl?: string;
    applicationDate?: Date;
    tags?: string[];
    description?: string;
    createdAt: Date;
    updatedAt: Date;

}

const JobApplicationSchema: Schema = new Schema<IJobApplication>({
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    status: { type: String, required: true },
    columnId: { type: Schema.Types.ObjectId, ref: "Column", required: true, index: true },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    userId: { type: String, required: true, index: true },
    order: { type: Number },
    notes: { type: String },
    salary: { type: Number },
    jobUrl: { type: String },
    applicationDate: { type: Date },
    tags: [{ type: String }],
    description: { type: String },
}, {
    timestamps: true,
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);