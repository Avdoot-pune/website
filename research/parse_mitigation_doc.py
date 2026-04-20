#!/usr/bin/env python3
import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


def extract_text(path):
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    lines = []
    for para in root.findall(".//w:p", ns):
        runs = [node.text for node in para.findall(".//w:t", ns) if node.text]
        if runs:
            lines.append("".join(runs).strip())
    return lines


def build_mapping(lines):
    document_text = "\n".join(lines).lower()

    base_mapping = {
        "high_pr_churn": [
            "Limit PR size to under 400 changed lines where possible.",
            "Enforce code reviews before merge to reduce churn loops.",
            "Batch unstable work behind feature flags to slow review thrash."
        ],
        "low_velocity": [
            "Reduce sprint scope to recover predictable delivery.",
            "Break large tickets into smaller backlog-ready tasks.",
            "Rebalance work ownership to remove execution bottlenecks."
        ],
        "review_bottleneck": [
            "Set reviewer SLAs for active pull requests.",
            "Rotate reviewers to spread review load across the team.",
            "Escalate high-risk pull requests earlier in the sprint."
        ],
        "long_cycle_time": [
            "Split large pull requests into smaller mergeable slices.",
            "Identify blocked dependencies before work sits idle.",
            "Track cycle time drift against the repository baseline each sprint."
        ],
        "urgent_hotfix_pattern": [
            "Create a stabilization lane for urgent fixes.",
            "Separate emergency work from planned sprint scope.",
            "Investigate the root cause behind repeated hotfix patterns."
        ],
        "anomalous_pr_behavior": [
            "Create a short risk spike to investigate the anomaly.",
            "Add the mitigation task to the sprint backlog with an explicit owner.",
            "Monitor the same signal in the next sprint burndown review."
        ]
    }

    if "create_risk_spike" in document_text or "risk spike" in document_text:
        for key in ("anomalous_pr_behavior", "urgent_hotfix_pattern"):
            base_mapping[key].append("Timebox a 1-2 day risk spike to clarify mitigation options.")

    if "risk backlog" in document_text or "backlog" in document_text:
        for actions in base_mapping.values():
            actions.append("Track this mitigation in the sprint risk backlog until exposure drops.")

    if "monitor" in document_text:
        for key in ("low_velocity", "review_bottleneck", "long_cycle_time"):
            base_mapping[key].append("Monitor the signal week over week to confirm the mitigation is working.")

    return {
        "mapping": base_mapping,
        "source_excerpt": lines[:40]
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Document path required."}, separators=(",", ":")))
        raise SystemExit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        print(json.dumps({"error": "Mitigation document not found."}, separators=(",", ":")))
        raise SystemExit(1)

    lines = extract_text(path)
    print(json.dumps(build_mapping(lines), separators=(",", ":")))


if __name__ == "__main__":
    main()
