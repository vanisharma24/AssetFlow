import type { Metadata } from "next";

import LandingView from "../components/LandingView";

export const metadata: Metadata = {
  title: "AssetFlow — Enterprise Asset Management",
  description:
    "AssetFlow centralizes asset tracking, resource booking, maintenance workflows, and audit management into one intelligent ERP platform.",
};

export default function LandingPage() {
  return <LandingView />;
}
