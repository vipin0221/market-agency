import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";

export const metadata: Metadata = {
  title: "Add a brand · Agency OS",
};

export default function NewBrandPage() {
  return <IntakeWizard />;
}
