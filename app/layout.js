import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata = {
  title: "AI Sprint Risk Analyzer",
  description:
    "Predict sprint failures before they happen with AI-powered pull request risk analysis and mitigation planning for software teams.",
  openGraph: {
    title: "AI Sprint Risk Analyzer",
    description:
      "Predict and prevent sprint failures with calibrated risk scoring, mitigation insights, and multi-repo engineering signals.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Sprint Risk Analyzer",
    description:
      "AI-powered risk analysis and mitigation planning for software teams."
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${monoFont.variable} bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
