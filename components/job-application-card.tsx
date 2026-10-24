
"use client";

import { Column, JobApplication } from "@/lib/models/models.type";

import {
  Edit2,
  ExternalLink,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Label } from "./ui/label";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

import { Button } from "./ui/button";

import {
  deleteJobApplication,
  updateJobApplication,
} from "@/lib/actions/job-applications";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import React, { useState } from "react";

import { Card, CardContent } from "./ui/card";


interface JobApplicationCardProps {
  job: JobApplication;
  columns: Column[];
  dragHandleProp?: React.HTMLAttributes<HTMLElement>;
}


export default function JobApplicationCard({
  job,
  columns,
  dragHandleProp,
}: JobApplicationCardProps) {

  const [isEditing, setIsEditing] =
    useState(false);

  /*
   * AI Match expandable section.
   *
   * Closed by default so the Kanban card
   * stays compact.
   */

  const [showAIAnalysis, setShowAIAnalysis] =
    useState(false);

  const [showApplicationDetails, setShowApplicationDetails] =
    useState(false);

  const [trackingData, setTrackingData] = useState({
    priority: job.priority || "Medium",
    applicationSource: job.applicationSource || "Manual",
    applicationMethod: job.applicationMethod || "Manual",
    applicationDate: job.applicationDate ? new Date(job.applicationDate).toISOString().slice(0, 10) : "",
    followUpDate: job.followUpDate ? new Date(job.followUpDate).toISOString().slice(0, 10) : "",
    lastFollowUpDate: job.lastFollowUpDate ? new Date(job.lastFollowUpDate).toISOString().slice(0, 10) : "",
    interviewDate: job.interviewDate ? new Date(job.interviewDate).toISOString().slice(0, 10) : "",
    deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : "",
    reminderEnabled: job.reminderEnabled ?? true,
    followUpCount: job.followUpCount ?? 0,
  });

  async function handleTrackingUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await updateJobApplication(job._id, trackingData);
      if (!result.error) setShowApplicationDetails(false);
    } catch (error) {
      console.error("Error updating application tracking:", error);
    }
  }


  const [formData, setFormData] = useState({
    company: job.company,

    position: job.position,

    location:
      job.location || "",

    notes:
      job.notes || "",

    salary:
      job.salary || "",

    jobUrl:
      job.jobUrl || "",

    columnId:
      job.columnId || "",

    tags:
      job.tags?.join(",") || "",

    description:
      job.description || "",
  });


  async function handleUpdate(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      const result =
        await updateJobApplication(
          job._id,
          {
            ...formData,

            salary:
              String(formData.salary),

            tags:
              formData.tags
                .split(",")
                .map(
                  (tag) =>
                    tag.trim()
                )
                .filter(
                  (tag) =>
                    tag.length > 0
                ),
          }
        );


      if (!result.error) {
        setIsEditing(false);
      }

    } catch (error) {

      console.error(
        "Error updating job application:",
        error
      );

    }
  }


  async function handleDelete() {

    try {

      await deleteJobApplication(
        job._id
      );

    } catch (error) {

      console.error(
        "Error deleting job application:",
        error
      );

    }
  }


  async function handleMove(
    newColumnId: string
  ) {

    try {

      await updateJobApplication(
        job._id,
        {
          columnId:
            newColumnId,
        }
      );

    } catch (error) {

      console.error(
        "Error moving job application:",
        error
      );

    }
  }


  return (
    <>
      <Card
        className="w-full min-w-0 cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
        {...dragHandleProp}
      >

        <CardContent className="min-w-0 p-4">

          <div className="flex min-w-0 items-start justify-between gap-4">

            {/* ================================================= */}
            {/* JOB INFORMATION */}
            {/* ================================================= */}

            <div className="min-w-0 flex-1">

              {/* Job Title */}

              <h3 className="line-clamp-2 break-words text-lg font-semibold">
                {job.position}
              </h3>


              {/* Company */}

              <p className="truncate text-sm text-muted-foreground">
                {job.company}
              </p>


              {/* Location */}

              {job.location && (
                <p className="mt-1 break-words text-xs text-muted-foreground">
                  📍 {job.location}
                </p>
              )}


              {/* ================================================= */}
              {/* AI SUMMARY */}
              {/* ================================================= */}

              {job.summary &&
                job.summary.length > 0 && (

                  <div className="mt-3 min-w-0">

                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      Job Summary
                    </p>


                    <ul className="space-y-1">

                      {job.summary.map(
                        (
                          point,
                          index
                        ) => (

                          <li
                            key={index}
                            className="flex min-w-0 gap-2 text-xs text-slate-600"
                          >

                            <span className="shrink-0">
                              •
                            </span>

                            <span className="min-w-0 break-words">
                              {point}
                            </span>

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}


              {/* ================================================= */}
              {/* TAGS */}
              {/* ================================================= */}

              {job.tags &&
                job.tags.length > 0 && (

                  <div className="mt-3 flex min-w-0 flex-wrap gap-2">

                    {job.tags.map(
                      (
                        tag,
                        index
                      ) => (

                        <span
                          key={index}
                          className="max-w-full break-words rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
                        >
                          {tag}
                        </span>

                      )
                    )}

                  </div>

                )}


              {/* ================================================= */}
              {/* JOB LINK */}
              {/* ================================================= */}

              {job.jobUrl && (

                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={job.jobUrl}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="mt-3 inline-flex items-center gap-1 text-sm text-primary"
                >

                  <ExternalLink className="h-4 w-4" />

                  View Job

                </a>

              )}


              {/* ================================================= */}
              {/* AI MATCH RESULT */}
              {/* ================================================= */}

              {job.matchResult && (

                <div className="mt-4 min-w-0 max-w-full rounded-lg border bg-slate-50">

                  {/* =========================================== */}
                  {/* AI MATCH HEADER */}
                  {/* =========================================== */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowAIAnalysis(
                        (previous) =>
                          !previous
                      );
                    }}
                    className="flex w-full min-w-0 items-center justify-between gap-3 p-3 text-left"
                  >

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <span className="text-sm font-semibold text-slate-800">
                          AI Match
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {job.matchResult.matchScore}%
                        </span>

                      </div>


                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {job.matchResult.recommendation}
                      </p>


                      {!showAIAnalysis && (

                        <p className="mt-1 break-words text-xs text-slate-500">

                          {job.matchResult.matchedSkills.length}
                          {" "}
                          matched
                          {" · "}
                          {job.matchResult.missingSkills.length}
                          {" "}
                          missing

                        </p>

                      )}

                    </div>


                    <div className="shrink-0 text-slate-500">

                      {showAIAnalysis ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}

                    </div>

                  </button>


                  {/* =========================================== */}
                  {/* EXPANDED AI ANALYSIS */}
                  {/* =========================================== */}

                  {showAIAnalysis && (

                    <div className="space-y-3 border-t px-3 pb-3 pt-3">

                      {/* Recommendation */}

                      <div>

                        <span className="text-xs text-muted-foreground">
                          Recommendation
                        </span>

                        <p className="break-words text-sm font-medium">
                          {job.matchResult.recommendation}
                        </p>

                      </div>


                      {/* ===================================== */}
                      {/* MATCHED SKILLS */}
                      {/* ===================================== */}

                      {job.matchResult.matchedSkills.length > 0 && (

                        <div>

                          <span className="text-xs text-muted-foreground">
                            Matched skills
                          </span>


                          <div className="mt-1 flex min-w-0 flex-wrap gap-1">

                            {job.matchResult.matchedSkills.map(
                              (skill) => (

                                <span
                                  key={skill}
                                  className="max-w-full break-words rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                                >
                                  {skill}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* MISSING SKILLS */}
                      {/* ===================================== */}

                      {job.matchResult.missingSkills.length > 0 && (

                        <div>

                          <span className="text-xs text-muted-foreground">
                            Missing skills
                          </span>


                          <div className="mt-1 flex min-w-0 flex-wrap gap-1">

                            {job.matchResult.missingSkills.map(
                              (skill) => (

                                <span
                                  key={skill}
                                  className="max-w-full break-words rounded-full bg-red-100 px-2 py-1 text-xs text-red-800"
                                >
                                  {skill}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* EXPERIENCE */}
                      {/* ===================================== */}

                      {job.matchResult.experienceMatch && (

                        <div>

                          <span className="text-xs text-muted-foreground">
                            Experience
                          </span>

                          <p className="break-words text-xs text-slate-700">
                            {job.matchResult.experienceMatch}
                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* EDUCATION */}
                      {/* ===================================== */}

                      {job.matchResult.educationMatch && (

                        <div>

                          <span className="text-xs text-muted-foreground">
                            Education
                          </span>

                          <p className="break-words text-xs text-slate-700">
                            {job.matchResult.educationMatch}
                          </p>

                        </div>

                      )}


                      {/* ===================================== */}
                      {/* WHY */}
                      {/* ===================================== */}

                      {job.matchResult.reason && (

                        <div>

                          <span className="text-xs text-muted-foreground">
                            Why?
                          </span>

                          <p className="break-words text-xs leading-5 text-slate-700">
                            {job.matchResult.reason}
                          </p>

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* ================================================= */}
            {/* MENU */}
            {/* ================================================= */}

            <div
              className="shrink-0"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <DropdownMenu>

                <DropdownMenuTrigger
                  asChild
                  className="flex items-center"
                >

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >

                    <MoreVertical className="h-4 w-4" />

                  </Button>

                </DropdownMenuTrigger>


                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >

                  {/* Application Details */}

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => setShowApplicationDetails(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Application Details
                  </DropdownMenuItem>

                  {/* Edit */}

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() =>
                      setIsEditing(true)
                    }
                  >

                    <Edit2 className="h-4 w-4" />

                    Edit

                  </DropdownMenuItem>


                  {/* Move */}

                  {columns.length > 1 && (

                    <>

                      {columns
                        .filter(
                          (column) =>
                            column._id !==
                            job.columnId
                        )
                        .map(
                          (column) => (

                            <DropdownMenuItem
                              key={column._id}
                              onClick={() =>
                                handleMove(
                                  column._id
                                )
                              }
                              className="flex items-center gap-2"
                            >

                              Move to{" "}
                              {column.name}

                            </DropdownMenuItem>

                          )
                        )}

                    </>

                  )}


                  {/* Delete */}

                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={handleDelete}
                  >

                    <Trash2 className="h-4 w-4" />

                    Delete

                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>

          </div>

        </CardContent>

      </Card>


      {/* ====================================================== */}
      {/* APPLICATION DETAILS DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Track your application progress, follow-ups, interviews, deadlines, and reminders.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleTrackingUpdate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tracking-priority">Priority</Label>
                <select id="tracking-priority" value={trackingData.priority} onChange={(e) => setTrackingData({ ...trackingData, priority: e.target.value as "Low" | "Medium" | "High" })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-source">Application Source</Label>
                <select id="tracking-source" value={trackingData.applicationSource} onChange={(e) => setTrackingData({ ...trackingData, applicationSource: e.target.value as "The Muse" | "Manual" | "Other" })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="The Muse">The Muse</option>
                  <option value="Manual">Manual</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-method">Application Method</Label>
                <select id="tracking-method" value={trackingData.applicationMethod} onChange={(e) => setTrackingData({ ...trackingData, applicationMethod: e.target.value as "Manual" | "External" | "Auto-Apply" })} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="Manual">Manual</option>
                  <option value="External">External</option>
                  <option value="Auto-Apply">Auto-Apply</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-application-date">Application Date</Label>
                <Input id="tracking-application-date" type="date" value={trackingData.applicationDate} onChange={(e) => setTrackingData({ ...trackingData, applicationDate: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-follow-up">Next Follow-up</Label>
                <Input id="tracking-follow-up" type="date" value={trackingData.followUpDate} onChange={(e) => setTrackingData({ ...trackingData, followUpDate: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-last-follow-up">Last Follow-up</Label>
                <Input id="tracking-last-follow-up" type="date" value={trackingData.lastFollowUpDate} onChange={(e) => setTrackingData({ ...trackingData, lastFollowUpDate: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-interview">Interview Date</Label>
                <Input id="tracking-interview" type="date" value={trackingData.interviewDate} onChange={(e) => setTrackingData({ ...trackingData, interviewDate: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-deadline">Application Deadline</Label>
                <Input id="tracking-deadline" type="date" value={trackingData.deadline} onChange={(e) => setTrackingData({ ...trackingData, deadline: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracking-follow-up-count">Follow-up Count</Label>
                <Input id="tracking-follow-up-count" type="number" min="0" value={trackingData.followUpCount} onChange={(e) => setTrackingData({ ...trackingData, followUpCount: Number(e.target.value) || 0 })} />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
              <input type="checkbox" checked={trackingData.reminderEnabled} onChange={(e) => setTrackingData({ ...trackingData, reminderEnabled: e.target.checked })} className="h-4 w-4" />
              <span>Enable reminders for this application</span>
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowApplicationDetails(false)}>Cancel</Button>
              <Button type="submit">Save Tracking Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* ====================================================== */}
      {/* EDIT JOB DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={isEditing}
        onOpenChange={
          setIsEditing
        }
      >

        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">

          <DialogHeader>

            <DialogTitle>
              Edit Job Application
            </DialogTitle>

            <DialogDescription>
              Update your job application details.
            </DialogDescription>

          </DialogHeader>


          <form
            className="space-y-4"
            onSubmit={handleUpdate}
          >

            <div className="space-y-4">

              {/* Company + Position */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label htmlFor="company">
                    Company*
                  </Label>

                  <Input
                    id="company"
                    required
                    value={
                      formData.company
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company:
                          e.target.value,
                      })
                    }
                  />

                </div>


                <div className="space-y-2">

                  <Label htmlFor="position">
                    Position*
                  </Label>

                  <Input
                    id="position"
                    required
                    value={
                      formData.position
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>


              {/* Location + Salary */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label htmlFor="location">
                    Location
                  </Label>

                  <Input
                    id="location"
                    value={
                      formData.location
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location:
                          e.target.value,
                      })
                    }
                  />

                </div>


                <div className="space-y-2">

                  <Label htmlFor="salary">
                    Salary
                  </Label>

                  <Input
                    id="salary"
                    value={
                      formData.salary
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>


              {/* Job URL */}

              <div className="space-y-2">

                <Label htmlFor="job-url">
                  Job URL
                </Label>

                <Input
                  id="job-url"
                  value={
                    formData.jobUrl
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobUrl:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* Tags */}

              <div className="space-y-2">

                <Label htmlFor="tags">
                  Tags (comma separated)
                </Label>

                <Input
                  id="tags"
                  placeholder="React, Tailwind, Node.js..."
                  value={
                    formData.tags
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* Description */}

              <div className="space-y-2">

                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  rows={3}
                  className="resize-none"
                  placeholder="Job Description"
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* Notes */}

              <div className="space-y-2">

                <Label htmlFor="notes">
                  Notes
                </Label>

                <Textarea
                  id="notes"
                  rows={4}
                  className="resize-none"
                  placeholder="Notes"
                  value={
                    formData.notes
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes:
                        e.target.value,
                    })
                  }
                />

              </div>

            </div>


            <DialogFooter>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsEditing(false)
                }
              >
                Cancel
              </Button>

              <Button type="submit">
                Save Changes
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </>
  );
}
