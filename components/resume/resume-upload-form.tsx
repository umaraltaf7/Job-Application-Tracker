"use client";

import { Button } from "@/components/ui/button";
import { uploadResumeAction } from "@/lib/actions/resume";
import {
  AlertCircle,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ResumeUploadFormProps = {
  onSuccess?: () => void;
};

export default function ResumeUploadForm({
  onSuccess,
}: ResumeUploadFormProps) {
  const [state, formAction, isPending] = useActionState(
    uploadResumeAction,
    null
  );

  const [selectedFileName, setSelectedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   * Close the upload modal after the server action
   * successfully returns resume data.
   */
  useEffect(() => {
    if (state?.data && !state?.error) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const fileLabel = useMemo(() => {
    if (!selectedFileName) {
      return "No file selected";
    }

    return selectedFileName.length > 28
      ? `${selectedFileName.slice(0, 25)}...`
      : selectedFileName;
  }, [selectedFileName]);

  const setSelectedFile = (file: File | null) => {
    if (!file) {
      setSelectedFileName("");
      return;
    }

    setSelectedFileName(file.name);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    // Put the dropped file into the actual file input.
    // This ensures the Server Action receives the File.
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      fileInputRef.current.files = dataTransfer.files;
    }

    setSelectedFile(file);
  };

  return (
    <form action={formAction} className="space-y-4">
      <div
        className={`rounded-2xl border border-dashed p-5 transition-all sm:p-6 ${
          isDragging
            ? "border-cyan-500 bg-cyan-50 shadow-sm"
            : "border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-slate-50"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">
              Drag and drop your resume here
            </p>

            <p className="text-sm text-slate-600">
              or{" "}
              <label
                htmlFor="resume-upload-input"
                className="cursor-pointer font-semibold text-cyan-700 underline-offset-4 hover:underline"
              >
                browse files
              </label>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-slate-200">
              PDF
            </span>

            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-slate-200">
              DOCX
            </span>

            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-slate-200">
              Max 5 MB
            </span>
          </div>

          <input
            ref={fileInputRef}
            id="resume-upload-input"
            type="file"
            name="resume"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload resume"
          />

          <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-slate-500" />

              <span className="truncate text-sm text-slate-700">
                {fileLabel}
              </span>
            </div>

            <span className="shrink-0 text-xs font-medium text-slate-500">
              PDF or DOCX
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Supported formats: PDF and DOCX • Up to 5 MB each
        </p>

        <Button
          type="submit"
          disabled={isPending || !selectedFileName}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Resume
            </>
          )}
        </Button>
      </div>

      {state?.error && (
        <p
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </p>
      )}
    </form>
  );
}