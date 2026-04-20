import { randomUUID } from "node:crypto";

const globalStore = globalThis;

if (!globalStore.__aiSprintRiskStore) {
  globalStore.__aiSprintRiskStore = {
    analyses: new Map(),
    submissions: []
  };
}

const store = globalStore.__aiSprintRiskStore;

export function saveAnalysis(analysis) {
  const id = randomUUID();
  const payload = {
    id,
    createdAt: new Date().toISOString(),
    ...analysis
  };

  store.analyses.set(id, payload);
  store.submissions.unshift({
    id,
    email: analysis.email,
    repoUrl: analysis.repoUrl,
    createdAt: payload.createdAt
  });

  return payload;
}

export function getAnalysis(id) {
  return store.analyses.get(id) ?? null;
}

export function getSubmissionHistory() {
  return store.submissions.slice(0, 25);
}
