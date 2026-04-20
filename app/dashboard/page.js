import { Suspense } from "react";
import DashboardView from "@/components/dashboard-view";
import SiteHeader from "@/components/site-header";

export const metadata = {
  title: "Dashboard | AI Sprint Risk Analyzer",
  description: "Live sprint risk dashboard with risk factors and mitigation guidance."
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Suspense fallback={null}>
          <DashboardView />
        </Suspense>
      </section>
    </main>
  );
}
