import { getAnalysis } from "@/lib/analysis-store";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const analysis = getAnalysis(resolvedParams.id);

  if (!analysis) {
    return Response.json({ error: "Analysis not found." }, { status: 404 });
  }

  return Response.json(analysis, { status: 200 });
}
