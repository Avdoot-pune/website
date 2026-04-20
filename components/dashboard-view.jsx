"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const factorLabels = {
  high_pr_churn: "High PR churn",
  low_velocity: "Low velocity",
  review_bottleneck: "Review bottleneck",
  long_cycle_time: "Long cycle time",
  urgent_hotfix_pattern: "Urgent hotfix pattern",
  anomalous_pr_behavior: "Anomalous PR behavior"
};

function toPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function levelTone(level) {
  switch (level) {
    case "CRITICAL":
      return "border-rose-400/30 bg-rose-400/12 text-rose-100";
    case "HIGH":
      return "border-orange-400/30 bg-orange-400/12 text-orange-100";
    case "MEDIUM":
      return "border-amber-300/30 bg-amber-300/12 text-amber-50";
    default:
      return "border-emerald-400/30 bg-emerald-400/12 text-emerald-100";
  }
}

function labelForFactor(factor) {
  return factorLabels[factor] ?? factor.replaceAll("_", " ");
}

function Metric({ label, value, toneClass }) {
  return (
    <div className={`rounded-[1.5rem] border px-5 py-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">{label}</p>
      <p className="mt-3 font-heading text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setError("No analysis id was provided.");
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch(`/api/analyze/${id}`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load dashboard data.");
        }

        if (!cancelled) {
          setPayload(data);
          setStatus("ready");
        }
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(loadError.message || "Unable to load dashboard data.");
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="panel mx-auto max-w-5xl rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
          <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)] [animation:pulse-soft_1.4s_ease-in-out_infinite]" />
        </div>
        <h1 className="font-heading mt-6 text-3xl font-semibold text-white">Analyzing repository using AI</h1>
        <p className="mt-4 text-slate-400">
          Pull request risk patterns, failure probability, and mitigation guidance are loading now.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="panel mx-auto max-w-4xl rounded-[2rem] p-8 text-center">
        <h1 className="font-heading text-3xl font-semibold text-white">Dashboard unavailable</h1>
        <p className="mt-4 text-slate-400">{error}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 font-semibold text-cyan-100 hover:-translate-y-0.5"
        >
          Back to Analyzer
        </Link>
      </div>
    );
  }

  const toneClass = levelTone(payload.risk_level);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="panel rounded-[2rem] p-8">
        <p className="section-kicker">Live Dashboard</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-semibold text-white">Sprint Risk Analysis</h1>
            <p className="mt-3 text-slate-400">
              Repository: <span className="text-slate-200">{payload.repoUrl}</span>
            </p>
          </div>
          <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${toneClass}`}>
            Risk Level: {payload.risk_level}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Metric label="Risk Score" value={payload.risk_score} toneClass={toneClass} />
        <Metric
          label="Failure Probability"
          value={toPercent(payload.failure_probability)}
          toneClass="border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
        />
        <Metric
          label="Analysis Status"
          value="Complete"
          toneClass="border-white/10 bg-white/5 text-slate-100"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="panel rounded-[2rem] p-6">
          <h2 className="font-heading text-2xl font-semibold text-white">Key Risk Factors</h2>
          <ul className="mt-6 space-y-3">
            {payload.risk_factors.map((factor) => (
              <li key={factor} className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.85)]" />
                <span className="text-slate-300">{labelForFactor(factor)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel rounded-[2rem] p-6">
          <h2 className="font-heading text-2xl font-semibold text-white">Mitigation Plan</h2>
          <div className="mt-6 space-y-5">
            {Object.entries(payload.mitigation).map(([factor, actions]) => (
              <div key={factor} className="rounded-[1.5rem] border border-white/8 bg-slate-950/70 p-5">
                <p className="font-heading text-lg font-semibold text-white">{labelForFactor(factor)}</p>
                <ul className="mt-4 space-y-3">
                  {actions.map((action) => (
                    <li key={action} className="flex items-start gap-3 text-slate-300">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 font-semibold text-cyan-100 hover:-translate-y-0.5"
        >
          Analyze Another Repo
        </Link>
        <a
          href={payload.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 hover:-translate-y-0.5"
        >
          Open Repository
        </a>
      </div>
    </div>
  );
}
