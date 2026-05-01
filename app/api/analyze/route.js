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
      model_type: pythonResult.model_type,
      model_architecture: pythonResult.model_architecture ?? [],
      model_justification: pythonResult.model_justification,
      mitigation_justification: pythonResult.mitigation_justification,
      mitigation_engine: pythonResult.mitigation_engine,
      anomaly_detection: pythonResult.anomaly_detection,
      training_mode: pythonResult.training_mode,
      analysis_mode: pythonResult.analysis_mode,
      mitigation
    });

    return Response.json(
      {
        analysisId: saved.id,
        risk_score: saved.risk_score,
        failure_probability: saved.failure_probability,
        risk_level: saved.risk_level,
        risk_factors: saved.risk_factors,
        model_type: saved.model_type,
        model_architecture: saved.model_architecture,
        model_justification: saved.model_justification,
        mitigation_justification: saved.mitigation_justification,
        mitigation_engine: saved.mitigation_engine,
        anomaly_detection: saved.anomaly_detection,
        training_mode: saved.training_mode,
        analysis_mode: saved.analysis_mode,
        mitigation: saved.mitigation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analyze route failed", error);
    return jsonError("Analysis failed", 500);
  }
}
