import path from "node:path";
import { loadMitigationDocument } from "@/lib/python-runtime";

let mitigationCache = null;

const fallbackMapping = {
  high_pr_churn: [
    "Limit PR size to under 400 changed lines where possible.",
    "Enforce code reviews before merge to reduce churn loops."
  ],
  low_velocity: [
    "Reduce sprint scope to recover predictable delivery.",
    "Break large tickets into smaller backlog-ready tasks."
  ],
  review_bottleneck: [
    "Set reviewer SLAs for active pull requests.",
    "Rotate reviewers to spread review load across the team."
  ],
  long_cycle_time: [
    "Split large pull requests into smaller mergeable slices.",
    "Track cycle time drift against the repository baseline each sprint."
  ],
  urgent_hotfix_pattern: [
    "Create a stabilization lane for urgent fixes.",
    "Separate emergency work from planned sprint scope."
  ],
  anomalous_pr_behavior: [
    "Create a short risk spike to investigate the anomaly.",
    "Add the mitigation task to the sprint backlog with an explicit owner."
  ]
};

export async function getMitigationCatalog() {
  if (mitigationCache) {
    return mitigationCache;
  }

  const docPath =
    process.env.MITIGATION_DOC_PATH?.trim() ||
    path.join(process.env.USERPROFILE || "", "OneDrive", "Desktop", "mitigation.docx");

  try {
    mitigationCache = await loadMitigationDocument(docPath);
  } catch {
    mitigationCache = {
      mapping: fallbackMapping,
      source_excerpt: []
    };
  }

  return mitigationCache;
}

export async function buildMitigationPlan(riskFactors) {
  const catalog = await getMitigationCatalog();
  const plan = {};

  for (const factor of riskFactors) {
    plan[factor] = catalog.mapping[factor] ?? [];
  }

  return plan;
}
