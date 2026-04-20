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
- loads mitigation actions from `mitigation.docx`
- caches the result in memory
- redirects the user to `/dashboard?id=...`

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
