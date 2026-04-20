import { saveAnalysis } from "@/lib/analysis-store";
import { buildMitigationPlan } from "@/lib/mitigation-engine";
import { runRepoAnalysis } from "@/lib/python-runtime";

export const runtime = "nodejs";

const REPO_PATTERN = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const repoUrl = sanitize(body.repoUrl);
    const email = sanitize(body.email);

    if (!repoUrl || !email) {
      return jsonError("GitHub Repo URL and email are required.", 400);
    }

    if (!REPO_PATTERN.test(repoUrl)) {
      return jsonError("Please enter a valid GitHub repository URL.", 400);
    }

    if (!EMAIL_PATTERN.test(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }

    const pythonResult = await runRepoAnalysis(repoUrl);

    if (pythonResult.error) {
      return jsonError(pythonResult.error, 422);
    }

    const mitigation = await buildMitigationPlan(pythonResult.risk_factors ?? []);

    const saved = saveAnalysis({
      email,
      repoUrl,
      risk_score: pythonResult.risk_score,
      failure_probability: pythonResult.failure_probability,
      risk_level: pythonResult.risk_level,
      risk_factors: pythonResult.risk_factors ?? [],
      mitigation
    });

    return Response.json(
      {
        analysisId: saved.id,
        risk_score: saved.risk_score,
        failure_probability: saved.failure_probability,
        risk_level: saved.risk_level,
        risk_factors: saved.risk_factors,
        mitigation: saved.mitigation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analyze route failed", error);
    return jsonError("Analysis failed", 500);
  }
}
