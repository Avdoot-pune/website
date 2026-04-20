import Link from "next/link";
import AnalyzeForm from "@/components/analyze-form";
import SectionHeading from "@/components/section-heading";
import SiteHeader from "@/components/site-header";
import {
  featureCards,
  mitigationCards,
  productPillars,
  sampleOutput,
  signalBadges,
  trustPoints,
  workflowSteps
} from "@/lib/site-data";

const iconMap = {
  gauge: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M4.5 15a7.5 7.5 0 1 1 15 0" />
      <path d="M12 13l4-4" />
      <path d="M12 13l-2.5 3.5" />
    </svg>
  ),
  probability: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M7 17V7" />
      <path d="M12 17V4" />
      <path d="M17 17v-6" />
    </svg>
  ),
  drivers: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M4 19h16" />
      <path d="M7 15l3-3 3 2 4-5" />
      <circle cx="7" cy="15" r="1" />
      <circle cx="10" cy="12" r="1" />
      <circle cx="13" cy="14" r="1" />
      <circle cx="17" cy="9" r="1" />
    </svg>
  ),
  mitigation: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]">
      <path d="M12 3l7 4v5c0 4.4-2.4 7.8-7 9-4.6-1.2-7-4.6-7-9V7l7-4z" />
      <path d="M9.5 12.5l1.8 1.8 3.2-4.3" />
    </svg>
  )
};

function MetricCard({ label, value, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300/80">{label}</p>
      <p className="mt-3 font-heading text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />
      <span className="text-slate-300">{children}</span>
    </li>
  );
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <SiteHeader />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem]">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute right-16 top-28 h-56 w-56 rounded-full bg-violet-500/18 blur-[120px]" />
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
            Predict and Prevent Sprint Failures
          </div>

          <h1 className="hero-title mt-8 text-white">Predict Sprint Failures Before They Happen</h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            AI-powered risk analysis plus mitigation for software teams. Turn live pull request
            activity into early warning signals, failure probability, and concrete sprint actions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#analyze"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-7 py-4 font-semibold text-slate-950 shadow-[0_20px_60px_rgba(34,211,238,0.22)] hover:-translate-y-0.5"
            >
              Analyze My Repo
            </a>
            <a
              href="#sample-output"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-4 font-semibold text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/8"
            >
              View Sample Output
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {signalBadges.map((badge) => (
              <div
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                {badge}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {productPillars.map((pillar) => (
              <div
                key={pillar}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-slate-300"
              >
                {pillar}
              </div>
            ))}
          </div>
        </div>

        <div className="panel gradient-ring scanline relative rounded-[2rem] p-1">
          <div className="panel-strong relative rounded-[calc(2rem-1px)] p-6 sm:p-8">
            <div className="spotlight" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-2xl font-semibold text-white">Live Risk Snapshot</p>
                <p className="mt-1 text-sm text-slate-400">Incoming PR and sprint intelligence</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Real-time ready
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MetricCard label="Risk Score" value="0.38" tone="danger" />
              <MetricCard label="Failure Probability" value="27%" />
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-heading text-lg text-white">Top Risk Drivers</p>
                  <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                    High
                  </span>
                </div>
                <ul className="space-y-3 text-sm">
                  <Bullet>Declining velocity against repo baseline</Bullet>
                  <Bullet>High PR churn over the last 48 hours</Bullet>
                  <Bullet>Urgency language detected in titles and comments</Bullet>
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-heading text-lg text-white">Mitigation Plan</p>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                    Actionable
                  </span>
                </div>
                <ul className="space-y-3 text-sm">
                  <Bullet>Reduce sprint scope by 20%</Bullet>
                  <Bullet>Limit PR size and batch risky changes</Bullet>
                  <Bullet>Assign a dedicated reviewer for high-risk PRs</Bullet>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple intake flow backed by research-grade engineering risk signals"
          description="The experience stays lightweight for visitors, while the underlying product story makes it clear this can evolve into a GitHub-native, multi-repo risk platform."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="panel rounded-[2rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 font-heading text-lg font-semibold text-cyan-200">
                0{index + 1}
              </div>
              <h3 className="mt-6 font-heading text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-4 leading-7 text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Built to explain risk, not just score it"
          description="This landing page keeps the product promise crisp: teams understand what is happening, why risk is rising, and what to do next."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => (
            <div key={feature.title} className="panel rounded-[2rem] p-6 hover:-translate-y-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                {iconMap[feature.icon]}
              </div>
              <h3 className="mt-6 font-heading text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-4 leading-7 text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="mitigation" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Mitigation"
            title="Mitigation is the product, not an afterthought"
            description="Your engine is strongest when elevated risk leads directly to a response plan. These example plays mirror the backlog-ready mitigation patterns your research framework points toward."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {mitigationCards.map((card) => (
              <div key={card.risk} className="panel rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-heading text-xl font-semibold text-white">{card.risk}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    Fix
                  </span>
                </div>
                <p className="mt-4 leading-7 text-slate-400">{card.impact}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {card.fixes.map((fix) => (
                    <Bullet key={fix}>{fix}</Bullet>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sample-output" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Sample Output"
          title="A dashboard-style result that feels operational"
          description="The sample report is intentionally concrete so visitors can imagine what their team would receive after analysis."
        />

        <div className="panel scanline mt-12 overflow-hidden rounded-[2rem]">
          <div className="fade-grid border-b border-white/8 px-6 py-4 sm:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
                Sprint Risk Report
              </span>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <MetricCard
                label="Risk Score"
                value={`${sampleOutput.riskScore} (${sampleOutput.riskLevel})`}
                tone="danger"
              />
              <MetricCard label="Failure Probability" value={sampleOutput.failureProbability} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-5">
                <p className="font-heading text-lg font-semibold text-white">Top Risks</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {sampleOutput.topRisks.map((item) => (
                    <Bullet key={item}>{item}</Bullet>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/75 p-5">
                <p className="font-heading text-lg font-semibold text-white">Mitigation</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {sampleOutput.mitigation.map((item) => (
                    <Bullet key={item}>{item}</Bullet>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="analyze" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="Request Analysis"
            title="Turn curiosity into a live repo risk report"
            description="This is intentionally a lightweight hosted flow: visitors submit a repository URL and email, then receive a generated report without needing a full SaaS signup."
          />
          <AnalyzeForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Trust"
          title="Designed to feel credible to engineering leaders"
          description="The strongest conversion moments come from pairing a clean interface with believable technical depth and a mitigation-first story."
          align="center"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="panel rounded-[2rem] p-6">
              <p className="font-heading text-xl font-semibold text-white">{point.title}</p>
              <p className="mt-4 leading-7 text-slate-400">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="font-heading text-base text-white">AI Sprint Risk Analyzer</p>
            <p className="mt-1">Research-inspired landing page for predictive sprint risk and mitigation.</p>
          </div>

          <div className="flex items-center gap-5">
            <Link href="https://github.com" className="hover:text-white">
              GitHub
            </Link>
            <a href="#analyze" className="hover:text-white">
              Analyze My Repo
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
