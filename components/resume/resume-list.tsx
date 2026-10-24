import { Button } from "@/components/ui/button";
import { getUserResumes } from "@/lib/actions/resume";
import { FileText, Plus } from "lucide-react";
import ResumeItem from "./resume-item";

type ResumeListItem = {
  _id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
};

export default async function ResumeList() {
  const result = await getUserResumes();

  if (result.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {result.error}
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
            <FileText className="h-6 w-6" />
          </div>

          <h3 className="text-xl font-semibold text-slate-900">
            No resumes uploaded yet
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add a PDF or DOCX resume to keep your application materials organized and ready to use.
          </p>

          <a href="#resume-upload-input" className="mt-5">
            <Button type="button" size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Resume
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {result.data.map((resume: ResumeListItem) => (
        <ResumeItem
          key={resume._id}
          resume={resume}
        />
      ))}
    </div>
  );
}