export const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Mitigation", href: "#mitigation" },
  { label: "Sample Output", href: "#sample-output" }
];

export const signalBadges = [
  "Calibrated XGBoost",
  "Cross-Repo Validation",
  "Isolation Forest Alerts",
  "Monte Carlo Sprint Forecasting"
];

export const workflowSteps = [
  {
    title: "Submit your repo and sprint context",
    description:
      "Start with a GitHub repository URL and let the intake flow capture the signals your team already produces."
  },
  {
    title: "AI analyzes live engineering risk patterns",
    description:
      "The engine scores pull requests using calibrated ML, anomaly detection, NLP urgency signals, and hybrid heuristics."
  },
  {
    title: "Get a risk score and mitigation plan",
    description:
      "Teams receive the probability of sprint failure, top risk drivers, and practical next-step recommendations."
  }
];

export const featureCards = [
  {
    title: "Risk Score Prediction",
    description:
      "Score every PR and sprint against patterns linked to project slowdowns before they become delivery problems.",
    icon: "gauge"
  },
  {
    title: "Failure Probability",
    description:
      "Translate raw engineering signals into calibrated likelihoods your team can trust for planning and escalation.",
    icon: "probability"
  },
  {
    title: "Key Risk Drivers",
    description:
      "See why risk is rising with interpretable signals like churn, cycle time shifts, anomaly flags, and urgency language.",
    icon: "drivers"
  },
  {
    title: "Actionable Mitigation Plan",
    description:
      "Move from alerting to action with sprint-level fixes that reduce risk exposure instead of just describing it.",
    icon: "mitigation"
  }
];

export const mitigationCards = [
  {
    risk: "High PR churn",
    impact: "Frequent changes increase merge friction, rework, and review fatigue.",
    fixes: ["Limit PR size", "Enforce code reviews", "Batch unstable work behind feature flags"]
  },
  {
    risk: "Velocity drop",
    impact: "The sprint slows when large tasks expand faster than the team can close them.",
    fixes: ["Reduce sprint scope", "Break tasks smaller", "Rebalance work across owners"]
  },
  {
    risk: "Urgent hotfix pressure",
    impact: "Emergency language and reactive fixes often signal instability around delivery dates.",
    fixes: ["Create a stabilization lane", "Isolate risky changes", "Escalate blockers earlier"]
  },
  {
    risk: "Review bottlenecks",
    impact: "Long review queues hide compounding risk and push uncertainty into the end of the sprint.",
    fixes: ["Set reviewer SLAs", "Rotate reviewers", "Prioritize high-risk PRs first"]
  }
];

export const sampleOutput = {
  riskScore: "0.38",
  riskLevel: "HIGH",
  failureProbability: "27%",
  topRisks: ["Declining velocity", "High PR churn", "Discussion-heavy PRs", "Late review completion"],
  mitigation: [
    "Reduce sprint scope by 20%",
    "Limit PR size to smaller review batches",
    "Move one feature to a follow-up sprint",
    "Assign a dedicated reviewer rotation"
  ]
};

export const trustPoints = [
  {
    title: "Built on a research-grade engine",
    description:
      "Grounded in calibrated XGBoost scoring, anomaly detection, and transfer testing across TensorFlow, PyTorch, and Keras."
  },
  {
    title: "Mitigation-first by design",
    description:
      "Every elevated risk can be paired with backlog-ready actions, sprint adjustments, and operational next steps."
  },
  {
    title: "Designed for real engineering workflows",
    description:
      "The platform vision covers GitHub PR events, PR comments, dashboard reporting, and multi-repository scale."
  }
];

export const productPillars = [
  "Listens to GitHub pull request events",
  "Comments risk analysis directly on PRs",
  "Surfaces team-wide dashboard signals",
  "Scales across multiple repositories"
];
