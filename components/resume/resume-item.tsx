"use client";

import { Button } from "@/components/ui/button";
import {
  deleteResume,
  setDefaultResume,
} from "@/lib/actions/resume";
import { cn } from "@/lib/utils";
import {
  Check,
  FileText,
  Loader2,
  Star,
  Trash2,
  FileType2,
} from "lucide-react";
import { useTransition } from "react";

interface ResumeItemProps {
  resume: {
    _id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isDefault: boolean;
  };
}

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export default function ResumeItem({ resume }: ResumeItemProps) {
  const [isPending, startTransition] = useTransition();

  const fileType = resume.mimeType.includes("pdf")
    ? "PDF"
    : resume.mimeType.includes("word") || resume.mimeType.includes("document")
      ? "DOCX"
      : "FILE";

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteResume(resume._id);

      if (result.error) {
        alert(result.error);
      }
    });
  };

  const handleSetDefault = () => {
    startTransition(async () => {
      const result = await setDefaultResume(resume._id);

      if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        resume.isDefault
          ? "border-cyan-200 bg-cyan-50/40"
          : "border-slate-200"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
              resume.isDefault
                ? "bg-cyan-100 text-cyan-700 ring-cyan-200"
                : "bg-slate-100 text-slate-600 ring-slate-200"
            )}
          >
            {fileType === "PDF" ? (
              <FileText className="h-5 w-5" />
            ) : (
              <FileType2 className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {resume.fileName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fileType} • {formatFileSize(resume.fileSize)}
            </p>
          </div>
        </div>

        {resume.isDefault && (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-800">
            <Check className="h-3.5 w-3.5" />
            Default
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Star className={cn("h-3.5 w-3.5", resume.isDefault ? "text-cyan-600" : "text-slate-300")} />
          <span>{resume.isDefault ? "Primary resume" : "Secondary resume"}</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!resume.isDefault && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSetDefault}
              disabled={isPending}
              aria-label={`Set ${resume.fileName} as default resume`}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Setting...
                </>
              ) : (
                "Set as Default"
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`Delete ${resume.fileName}`}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}