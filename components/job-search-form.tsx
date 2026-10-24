"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface JobSearchFormProps {
  defaultKeyword: string;
  defaultLocation: string;
  defaultRemote: boolean;
  defaultDays?: string;
}

export default function JobSearchForm({
  defaultKeyword,
  defaultLocation,
  defaultRemote,
  defaultDays,
}: JobSearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [location, setLocation] = useState(defaultLocation);
  const [remote, setRemote] = useState(defaultRemote);
  const [days, setDays] = useState(defaultDays ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    params.set("remote", String(remote));
    if (days) params.set("days", days);
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="w-full flex-1 basis-full sm:w-auto sm:basis-auto sm:min-w-[200px]">
        <label className="mb-1 block text-sm font-medium text-slate-700">Keyword</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Software Engineer"
        />
      </div>

      <div className="w-full flex-1 basis-full sm:w-auto sm:basis-auto sm:min-w-[160px]">
        <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Pakistan"
        />
      </div>

      <div className="w-full sm:w-auto sm:min-w-[140px]">
        <label className="mb-1 block text-sm font-medium text-slate-700">Posted within</label>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Any time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      <div className="flex items-center gap-2 sm:pb-2">
        <input
          id="remote"
          type="checkbox"
          checked={remote}
          onChange={(e) => setRemote(e.target.checked)}
        />
        <label htmlFor="remote" className="text-sm text-slate-700">Include remote</label>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-cyan-700 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-800 sm:w-auto"
      >
        Search
      </button>
    </form>
  );
}