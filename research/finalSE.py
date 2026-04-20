#!/usr/bin/env python3
import json
import os
import pickle
import re
import sys
import warnings
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

REFERENCE_REPOS = [
    ("tensorflow", "tensorflow"),
    ("pytorch", "pytorch"),
    ("keras-team", "keras"),
]
FEATURE_COLUMNS = [
    "cycle_time_norm",
    "comments_norm",
    "has_discussion",
    "text_risk",
    "cycle_vs_repo",
    "comments_vs_repo",
    "title_len",
    "is_urgent",
]
BUG_KEYWORDS = ("fix", "bug", "failure", "error", "incident", "regression")
URGENT_KEYWORDS = ("urgent", "hotfix", "critical", "emergency", "blocker", "sev")
BOT_PATTERN = re.compile(r"automated|auto|bot", re.I)
ARTIFACT_DIR = Path(__file__).resolve().parent / ".model_cache"
ARTIFACT_TTL = timedelta(hours=12)
USER_AGENT = "AI-Sprint-Risk-Analyzer/2.0"

warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn.calibration")


def emit(payload, exit_code=0):
    print(json.dumps(payload, separators=(",", ":")))
    raise SystemExit(exit_code)


def clamp(value, low=0.0, high=1.0):
    return max(low, min(high, value))


def safe_quantile(values, q, default=0.0):
    if not values:
        return default
    return float(np.quantile(np.asarray(values, dtype=float), q))


def mean(values, default=0.0):
    return float(np.mean(np.asarray(values, dtype=float))) if values else default


def logistic(value, midpoint=0.58, steepness=5.2):
    return 1.0 / (1.0 + np.exp(-steepness * (value - midpoint)))


def parse_repo_url(repo_url):
    match = re.match(r"^https://github\.com/([^/\s]+)/([^/\s]+)/?$", repo_url.strip(), re.I)
    if not match:
        emit({"error": "Invalid GitHub repository URL."}, 1)
    return match.group(1), match.group(2)


def parse_datetime(value):
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def contains_keyword(text, keywords):
    lowered = (text or "").lower()
    return any(keyword in lowered for keyword in keywords)


def github_get_json(url):
    headers = {"User-Agent": USER_AGENT, "Accept": "application/vnd.github+json"}
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_pull_requests(owner, repo, pages=2, per_page=80):
    merged_prs = []
    for page in range(1, pages + 1):
        query = urllib.parse.urlencode({"state": "closed", "per_page": per_page, "page": page})
        url = f"https://api.github.com/repos/{owner}/{repo}/pulls?{query}"
        payload = github_get_json(url)
        if not payload:
            break
        for pr in payload:
            if pr.get("merged_at"):
                merged_prs.append(pr)
    return merged_prs


def compute_probability(row):
    score = 0.0
    score += 0.40 * min(row["cycle_time_norm"], 1.0)
    score += 0.20 * min(row["comments_norm"], 1.0)
    score += 0.15 * row["has_discussion"]
    score += 0.10 * (row["text_risk"] / 2.0)
    score += 0.15 * min(row["cycle_vs_repo"], 2.0) / 2.0
    if row["anomaly_flag"] == 1:
        score += 0.20
    return clamp(score)


def compute_impact(row):
    impact = 0.0
    impact += 0.40 * min(row["cycle_time_norm"], 1.5)
    impact += 0.30 * (row["text_risk"] / 2.0)
    if row["anomaly_flag"] == 1:
        impact += 0.30
    return clamp(impact, high=0.95)


def build_rows(prs, repo_name):
    rows = []
    for pr in prs:
        title = pr.get("title") or ""
        if BOT_PATTERN.search(title):
            continue

        created_at = parse_datetime(pr["created_at"])
        merged_at = parse_datetime(pr["merged_at"])
        cycle_time_days = max((merged_at - created_at).total_seconds() / (24 * 3600), 0.01)
        if cycle_time_days <= 0.01:
            continue

        body = pr.get("body") or ""
        comments = float(pr.get("comments", 0) or 0)
        combined_text = f"{title} {body}"

        rows.append(
            {
                "repo": repo_name,
                "title": title,
                "body": body,
                "title_len": len(title),
                "created_at": created_at,
                "merged_at": merged_at,
                "merged_day": merged_at.date().isoformat(),
                "cycle_time_days": cycle_time_days,
                "num_comments": comments,
                "has_discussion": 1.0 if comments > 0 else 0.0,
                "text_risk": 2.0 if contains_keyword(combined_text, BUG_KEYWORDS) else 0.0,
                "is_urgent": 1.0 if contains_keyword(combined_text, URGENT_KEYWORDS) else 0.0,
            }
        )
    return rows


def enrich_repo_rows(repo_rows):
    cycle_values = [row["cycle_time_days"] for row in repo_rows]
    comment_values = [row["num_comments"] for row in repo_rows]

    cycle_q75 = safe_quantile(cycle_values, 0.75, 1.0) or 1.0
    comment_q75 = safe_quantile(comment_values, 0.75, 1.0) or 1.0
    repo_avg_cycle = mean(cycle_values, default=1.0) or 1.0
    repo_avg_comments = mean(comment_values, default=1.0) or 1.0

    for row in repo_rows:
        row["risk_score"] = (
            row["cycle_time_days"] * 3.0
            + row["num_comments"] * 1.5
            + row["text_risk"] * 2.0
        )
        row["cycle_time_norm"] = clamp(row["cycle_time_days"] / cycle_q75, 0.0, 2.0)
        row["comments_norm"] = clamp(row["num_comments"] / comment_q75, 0.0, 2.0)
        row["cycle_vs_repo"] = row["cycle_time_days"] / max(repo_avg_cycle, 1e-6)
        row["comments_vs_repo"] = row["num_comments"] / max(repo_avg_comments, 1e-6)

    if len(repo_rows) >= 10:
        anomaly_matrix = np.asarray(
            [[row["cycle_time_days"], row["num_comments"], row["risk_score"]] for row in repo_rows],
            dtype=float,
        )
        isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        flags = (isolation_forest.fit_predict(anomaly_matrix) == -1).astype(int)
    else:
        flags = np.zeros(len(repo_rows), dtype=int)

    delay_threshold = safe_quantile(cycle_values, 0.85, repo_avg_cycle)
    elevated_delay_threshold = safe_quantile(cycle_values, 0.80, repo_avg_cycle)

    for index, row in enumerate(repo_rows):
        row["anomaly_flag"] = float(flags[index])
        row["probability"] = compute_probability(row)
        row["impact"] = compute_impact(row)
        row["final_risk_score"] = (0.65 * row["probability"]) + (0.35 * row["impact"])
        row["label_delay"] = 1 if row["cycle_time_days"] > delay_threshold else 0
        row["label_combined"] = 1 if row["label_delay"] and row["anomaly_flag"] == 1 else 0

    if sum(row["label_combined"] for row in repo_rows) < max(3, len(repo_rows) // 20):
        for row in repo_rows:
            row["label_combined"] = (
                1
                if row["cycle_time_days"] > elevated_delay_threshold
                and (row["anomaly_flag"] == 1 or row["text_risk"] > 0 or row["is_urgent"] == 1)
                else 0
            )

    return repo_rows


def ensure_minimum_rows(repo_rows):
    if not repo_rows:
        return []

    if len(repo_rows) >= 4:
        return repo_rows

    expanded = list(repo_rows)
    source_rows = list(repo_rows)
    target_size = 4

    while len(expanded) < target_size:
        base = dict(source_rows[len(expanded) % len(source_rows)])
        base["cycle_time_days"] = max(base["cycle_time_days"] * (1.0 + (0.03 * len(expanded))), 0.01)
        base["num_comments"] = max(base["num_comments"] + (len(expanded) % 2), 0.0)
        base["title_len"] = base["title_len"] + len(expanded)
        expanded.append(base)

    return expanded


def build_dataset(repo_specs):
    rows = []
    for owner, repo in repo_specs:
        prs = fetch_pull_requests(owner, repo)
        repo_rows = build_rows(prs, repo)
        if len(repo_rows) < 8:
            continue
        rows.extend(enrich_repo_rows(repo_rows))
    return rows


def rows_to_matrix(rows):
    return np.asarray([[float(row[column]) for column in FEATURE_COLUMNS] for row in rows], dtype=float)


def artifact_name_for(owner, repo):
    for ref_owner, ref_repo in REFERENCE_REPOS:
        if owner == ref_owner and repo == ref_repo:
            return f"leave_one_out_{ref_repo}"
    return "reference_general"


def artifact_path_for(owner, repo):
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    return ARTIFACT_DIR / f"{artifact_name_for(owner, repo)}.pkl"


def should_retrain(artifact_path):
    if not artifact_path.exists():
        return True
    modified_at = datetime.fromtimestamp(artifact_path.stat().st_mtime, tz=timezone.utc)
    return datetime.now(timezone.utc) - modified_at > ARTIFACT_TTL


def train_model(training_rows):
    if len(training_rows) < 20:
        raise RuntimeError("Not enough training pull requests were collected.")

    positives = sum(row["label_combined"] for row in training_rows)
    if positives == 0:
        raise RuntimeError("No positive training labels were generated for the calibrated model.")

    X_train = rows_to_matrix(training_rows)
    y_train = np.asarray([row["label_combined"] for row in training_rows], dtype=int)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    n_pos = int(np.sum(y_train))
    n_neg = int(len(y_train) - n_pos)
    pos_weight = n_neg / max(n_pos, 1)

    base_xgb = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=pos_weight,
        random_state=42,
        eval_metric="logloss",
        verbosity=0,
    )
    base_xgb.fit(X_train_scaled, y_train)

    calibrated_model = CalibratedClassifierCV(base_xgb, method="sigmoid", cv="prefit")
    calibrated_model.fit(X_train_scaled, y_train)

    return scaler, calibrated_model


def train_artifact(owner, repo):
    if any(owner == ref_owner and repo == ref_repo for ref_owner, ref_repo in REFERENCE_REPOS):
        training_specs = [
            spec for spec in REFERENCE_REPOS if not (spec[0] == owner and spec[1] == repo)
        ]
    else:
        training_specs = REFERENCE_REPOS

    try:
        training_rows = build_dataset(training_specs)
        scaler, calibrated_model = train_model(training_rows)
        training_mode = "cross_repo_reference"
    except Exception:
        training_specs = [(owner, repo)]
        training_rows = build_dataset(training_specs)
        scaler, calibrated_model = train_model(training_rows)
        training_mode = "self_supervised_repo"

    artifact = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "owner": owner,
        "repo": repo,
        "training_repos": training_specs,
        "training_mode": training_mode,
        "features": FEATURE_COLUMNS,
        "scaler": scaler,
        "model": calibrated_model,
    }

    artifact_path = artifact_path_for(owner, repo)
    with artifact_path.open("wb") as artifact_file:
        pickle.dump(artifact, artifact_file)

    return artifact


def load_or_train_artifact(owner, repo):
    artifact_path = artifact_path_for(owner, repo)
    if should_retrain(artifact_path):
        return train_artifact(owner, repo)

    with artifact_path.open("rb") as artifact_file:
        return pickle.load(artifact_file)


def classify_risk_level(score):
    if score >= 0.78:
        return "CRITICAL"
    if score >= 0.60:
        return "HIGH"
    if score >= 0.38:
        return "MEDIUM"
    return "LOW"


def build_sprint_series(rows, field_name):
    sprint_buckets = defaultdict(list)
    for row in rows:
        merged_at = row["merged_at"]
        week_start = merged_at - timedelta(days=merged_at.weekday())
        sprint_start = week_start - timedelta(days=week_start.isocalendar().week % 2)
        sprint_buckets[sprint_start.date().isoformat()].append(float(row[field_name]))
    return [mean(values) for _, values in sorted(sprint_buckets.items())]


def monte_carlo_failure_probability(series, seed_key):
    if not series:
        return 0.0
    threshold = safe_quantile(series, 0.75, default=mean(series))
    recent = series[-3:] or series
    augmented = np.asarray(series + recent, dtype=float)
    seed = abs(hash(seed_key)) % (2**32)
    rng = np.random.default_rng(seed)
    simulations = []
    sample_size = max(3, len(series))
    for _ in range(3000):
        sample = rng.choice(augmented, size=sample_size, replace=True)
        simulations.append(float(np.mean(sample)))
    return clamp(float(np.mean(np.asarray(simulations, dtype=float) > threshold)))


def derive_factor_scores(rows):
    recent = sorted(rows, key=lambda item: item["merged_at"], reverse=True)[:24]
    earlier = sorted(rows, key=lambda item: item["merged_at"], reverse=True)[24:48]

    recent_rate = len(recent) / 14.0 if recent else 0.0
    earlier_rate = len(earlier) / 14.0 if earlier else max(recent_rate, 0.1)
    velocity_drop = clamp(1.0 - (recent_rate / max(earlier_rate, 0.1)))

    daily_counts = defaultdict(int)
    for row in recent:
        daily_counts[row["merged_day"]] += 1
    volume_values = list(daily_counts.values())
    avg_volume = mean(volume_values, default=0.0)
    volatility = (
        clamp((max(volume_values) - min(volume_values)) / max(avg_volume, 1.0))
        if volume_values
        else 0.0
    )

    discussion_ratio = mean([row["has_discussion"] for row in recent], default=0.0)
    urgent_ratio = mean([row["is_urgent"] for row in recent], default=0.0)
    anomaly_ratio = mean([row["anomaly_flag"] for row in recent], default=0.0)
    avg_cycle_norm = mean(
        [min(row["cycle_time_norm"], 1.5) / 1.5 for row in recent],
        default=0.0,
    )
    avg_comment_norm = mean(
        [min(row["comments_norm"], 1.5) / 1.5 for row in recent],
        default=0.0,
    )

    return {
        "high_pr_churn": clamp((0.56 * volatility) + (0.24 * discussion_ratio) + (0.20 * avg_comment_norm)),
        "low_velocity": velocity_drop,
        "review_bottleneck": clamp((0.55 * discussion_ratio) + (0.45 * avg_comment_norm)),
        "long_cycle_time": avg_cycle_norm,
        "urgent_hotfix_pattern": urgent_ratio,
        "anomalous_pr_behavior": anomaly_ratio,
    }


def analyze_repository(repo_url):
    owner, repo = parse_repo_url(repo_url)
    artifact = load_or_train_artifact(owner, repo)

    target_prs = fetch_pull_requests(owner, repo)
    target_rows = build_rows(target_prs, repo)
    if not target_rows:
        emit({"error": "Not enough merged pull requests were found to analyze this repository."}, 1)

    sparse_history = len(target_rows) < 8
    target_rows = enrich_repo_rows(ensure_minimum_rows(target_rows))
    X_target = rows_to_matrix(target_rows)
    X_target_scaled = artifact["scaler"].transform(X_target)
    ml_probabilities = artifact["model"].predict_proba(X_target_scaled)[:, 1]

    for row, ml_probability in zip(target_rows, ml_probabilities):
        row["ml_risk_score"] = float(ml_probability)
        row["hybrid_risk_score"] = clamp((0.60 * row["final_risk_score"]) + (0.40 * row["ml_risk_score"]))

    recent_rows = sorted(target_rows, key=lambda item: item["merged_at"], reverse=True)[:24]
    sprint_series = build_sprint_series(target_rows, "hybrid_risk_score")
    failure_probability = monte_carlo_failure_probability(sprint_series, f"{owner}/{repo}")
    factor_scores = derive_factor_scores(target_rows)
    ranked_factors = sorted(factor_scores.items(), key=lambda item: item[1], reverse=True)
    selected_factors = [factor for factor, score in ranked_factors if score >= 0.30][:4]
    if not selected_factors:
        selected_factors = [ranked_factors[0][0]]

    top_hybrid = sorted([row["hybrid_risk_score"] for row in recent_rows], reverse=True)[:8]
    hybrid_pressure = mean(top_hybrid, default=0.0)
    factor_pressure = mean([score for _, score in ranked_factors[:4]], default=0.0)
    risk_signal = (
        0.50 * hybrid_pressure
        + 0.25 * failure_probability
        + 0.25 * factor_pressure
    )
    risk_score = clamp(float(logistic(risk_signal, midpoint=0.56, steepness=5.0)))

    return {
        "repo": f"{owner}/{repo}",
        "risk_score": round(risk_score, 2),
        "failure_probability": round(failure_probability, 2),
        "risk_level": classify_risk_level(risk_score),
        "risk_factors": selected_factors,
        "model_type": "calibrated_xgboost_hybrid",
        "model_trained_at": artifact["trained_at"],
        "training_mode": artifact.get("training_mode", "cross_repo_reference"),
        "analysis_mode": "sparse_history_fallback" if sparse_history else "full_history",
    }


def main():
    if len(sys.argv) < 2:
        emit({"error": "Repository URL argument is required."}, 1)

    try:
        emit(analyze_repository(sys.argv[1]), 0)
    except urllib.error.HTTPError as error:
        message = "GitHub returned an error while fetching pull requests."
        if error.code == 404:
            message = "The GitHub repository could not be found."
        elif error.code == 403:
            message = "GitHub rate limit reached. Set GITHUB_TOKEN or try again later."
        emit({"error": message}, 1)
    except urllib.error.URLError:
        emit({"error": "GitHub could not be reached from the Python analyzer."}, 1)
    except Exception as error:
        emit({"error": f"Analysis failed inside the Python risk engine: {error}"}, 1)


if __name__ == "__main__":
    main()
