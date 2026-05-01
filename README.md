# AI Sprint Risk Analyzer

A premium Next.js landing page for an AI product that predicts sprint failure risk and surfaces actionable mitigation guidance for software teams.

## Stack

- Next.js App Router
- Tailwind CSS
- Lightweight API route for form submission
- Optional Formspree forwarding

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Analysis flow

The form posts to `/api/analyze`, which:

- runs the Python analyzer in `research/finalSE.py`
- trains or reuses a persisted calibrated XGBoost artifact from `research/.model_cache`
- applies Isolation Forest anomaly detection to flag unusual Agile behavior without requiring failure labels
- loads mitigation actions from `mitigation.docx`
- caches the result in memory
- redirects the user to `/dashboard?id=...`

## Hybrid intelligence

The research engine combines three risk layers:

- Rule-based Agile signals: cycle time, comments, urgency keywords, discussion, and repo-relative deviation.
- Supervised ML: calibrated XGBoost predicts known sprint-risk patterns from generated historical labels.
- Unsupervised ML: Isolation Forest learns normal PR behavior and raises `anomaly_flag` for unusual cycle time, comment, or combined risk patterns.
- Mitigation engine: converts root causes into Agile-native actions, ROAM categories, and simulated risk reduction.

When `anomaly_flag` is `1`, the risk engine increases probability and impact pressure. In short: "We combine supervised learning for known risk patterns with unsupervised anomaly detection to capture unknown Agile failures."

## Mitigation engine

The mitigation layer in `research/finalSE.py` turns risk prediction into decision support:

- Root cause decomposition attributes risk to cycle time, discussion, complexity, text risk, and anomaly behavior.
- Agile actions map risks to RIMPRO, ART, ROAM, risk-adjusted backlog, and risk spike practices.
- ROAM classification marks each risky PR as `MITIGATE`, `OWN`, `ACCEPT`, or `RESOLVED`.
- Impact simulation estimates how much risk would drop after realistic cycle-time, discussion, and complexity improvements.

One-line framing: "We extend risk prediction into a closed-loop system by generating actionable mitigations and simulating their impact on sprint outcomes."

Create a `.env.local` file if you need custom paths or a GitHub token:

```bash
PYTHON_PATH=python
GITHUB_TOKEN=ghp_your_token
MITIGATION_DOC_PATH=C:\Users\your-user\OneDrive\Desktop\mitigation.docx
```

## Research artifact

Your original notebook export is preserved at [research/finalSE.original.py](./research/finalSE.original.py).
The production CLI analyzer lives at [research/finalSE.py](./research/finalSE.py).
Pinned Python ML dependencies live at [research/requirements.txt](./research/requirements.txt).

## Deploy

This project is ready for Vercel deployment:

```bash
npm run build
```
