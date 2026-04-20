"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const loadingMessages = [
  "Analyzing repository using AI...",
  "Scoring pull request risk signals...",
  "Generating mitigation guidance for your team..."
];

const initialForm = {
  repoUrl: "",
  email: ""
};

export default function AnalyzeForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (status !== "loading") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % loadingMessages.length);
    }, 950);

    return () => window.clearInterval(interval);
  }, [status]);

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus("loading");
    setMessage("");
    setLoadingStep(0);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong while submitting your request.");
      }

      if (!payload.analysisId) {
        throw new Error("Analysis completed, but no dashboard result was returned.");
      }

      setStatus("success");
      setMessage("Analysis complete. Opening your dashboard...");
      setForm(initialForm);

      window.setTimeout(() => {
        router.push(`/dashboard?id=${payload.analysisId}`);
      }, 350);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong while submitting your request.");
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="panel gradient-ring relative overflow-hidden rounded-[2rem] p-1">
      <div className="panel-strong rounded-[calc(2rem-1px)] p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-semibold text-white">Start your repo analysis</p>
            <p className="mt-2 text-sm text-slate-400">
              Submit your repository and we&apos;ll deliver a risk report with mitigation guidance.
            </p>
          </div>
          <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-200 sm:block">
            No GitHub token required
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="repoUrl" className="text-sm font-medium text-slate-200">
              GitHub Repo URL
            </label>
            <input
              id="repoUrl"
              name="repoUrl"
              type="url"
              required
              autoComplete="url"
              value={form.repoUrl}
              onChange={updateField}
              placeholder="https://github.com/your-org/your-repo"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-5 py-4 font-semibold text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.2)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {status === "loading" ? (
              <>
                <span className="flex gap-1">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-950 [animation-delay:-0.2s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-950 [animation-delay:-0.1s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-950" />
                </span>
                Analyzing...
              </>
            ) : (
              "Analyze My Repo"
            )}
          </button>
        </form>

        <div className="mt-6 min-h-14 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm">
          {status === "loading" ? (
            <div className="flex items-center gap-3 text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)] [animation:pulse-soft_1.4s_ease-in-out_infinite]" />
              <span>{loadingMessages[loadingStep]}</span>
            </div>
          ) : null}

          {status === "success" ? <p className="text-emerald-200">{message}</p> : null}
          {status === "error" ? <p className="text-rose-200">{message}</p> : null}
          {status === "idle" ? (
            <p className="text-slate-400">We&apos;ll analyze your repository and open the dashboard here.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
