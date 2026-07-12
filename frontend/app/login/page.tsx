import type { Metadata } from "next";
import { LightLogin } from "@/components/ui/sign-in";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your AssetFlow account to manage assets, allocations, bookings, and maintenance.",
};

export default function LoginPage() {
  return <LightLogin />;
}
