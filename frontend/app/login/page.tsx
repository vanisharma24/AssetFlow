import { Metadata } from "next";
import { Demo } from "@/components/ui/demo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AssetFlow ERP account to manage your business inventory, finance, and operations.",
};

export default function LoginPage() {
  return <Demo />;
}
