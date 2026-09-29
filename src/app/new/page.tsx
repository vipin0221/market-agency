import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";
import { requirePageOperator } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Add a brand · Agency OS",
};

export const dynamic = "force-dynamic";

export default async function NewBrandPage() {
  await requirePageOperator();
  return <IntakeWizard />;
}
