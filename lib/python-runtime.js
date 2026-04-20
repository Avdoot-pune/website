import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const ANALYZER_PATH = path.join(process.cwd(), "research", "finalSE.py");
const MITIGATION_HELPER_PATH = path.join(process.cwd(), "research", "parse_mitigation_doc.py");
const PYTHON_CHECK = "import json, sys; import numpy, sklearn, xgboost; print(json.dumps({'executable': sys.executable}))";

function execute(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      const output = stdout.trim();

      if (code !== 0) {
        const message = output || stderr.trim() || "Python process failed.";

        try {
          const parsed = JSON.parse(message);
          const error = new Error(parsed.error || "Python process failed.");
          error.payload = parsed;
          reject(error);
          return;
        } catch {}

        reject(new Error(message));
        return;
      }

      resolve(output);
    });
  });
}

function buildCandidateCommands() {
  const configuredPath = process.env.PYTHON_PATH?.trim();
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  const pathCandidates = [
    configuredPath,
    path.join(localAppData, "Programs", "Python", "Python313", "python.exe"),
    path.join(localAppData, "Programs", "Python", "Python312", "python.exe"),
    path.join(localAppData, "Programs", "Python", "Python311", "python.exe"),
    path.join(localAppData, "Programs", "Python", "Python310", "python.exe"),
    path.join(userProfile, "AppData", "Local", "Programs", "Python", "Python310", "python.exe")
  ].filter(Boolean);

  const fileCandidates = pathCandidates
    .filter((candidate) => candidate.endsWith(".exe"))
    .filter((candidate, index, values) => values.indexOf(candidate) === index)
    .filter((candidate) => fs.existsSync(candidate))
    .map((candidate) => ({ command: candidate, probeArgs: ["-c", PYTHON_CHECK] }));

  const commandCandidates = [
    { command: "python", probeArgs: ["-c", PYTHON_CHECK] },
    { command: "python3", probeArgs: ["-c", PYTHON_CHECK] },
    { command: "py", probeArgs: ["-3", "-c", PYTHON_CHECK] }
  ];

  return [...fileCandidates, ...commandCandidates];
}

let resolvedPythonCommandPromise = null;

async function resolvePythonCommand() {
  if (resolvedPythonCommandPromise) {
    return resolvedPythonCommandPromise;
  }

  resolvedPythonCommandPromise = (async () => {
    const candidates = buildCandidateCommands();
    let lastError;

    for (const candidate of candidates) {
      try {
        await execute(candidate.command, candidate.probeArgs);
        return candidate;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Python runtime with numpy, scikit-learn, and xgboost was not found.");
  })();

  return resolvedPythonCommandPromise;
}

async function runPythonScript(scriptPath, scriptArgs) {
  const candidate = await resolvePythonCommand();
  const args =
    candidate.command === "py"
      ? ["-3", scriptPath, ...scriptArgs]
      : [scriptPath, ...scriptArgs];

  return execute(candidate.command, args);
}

export async function runRepoAnalysis(repoUrl) {
  try {
    const raw = await runPythonScript(ANALYZER_PATH, [repoUrl]);
    return JSON.parse(raw);
  } catch (error) {
    if (error.payload) {
      return error.payload;
    }
    throw error;
  }
}

export async function loadMitigationDocument(docPath) {
  const raw = await runPythonScript(MITIGATION_HELPER_PATH, [docPath]);
  return JSON.parse(raw);
}
