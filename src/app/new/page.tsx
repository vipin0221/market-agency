import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake-wizard";
import { PasswordNotice } from "@/components/password-notice";
import { requirePageOperator } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Add a brand · Agency OS",
};

export const dynamic = "force-dynamic";

export default async function NewBrandPage() {
  const session = await requirePageOperator();
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <PasswordNotice mustChange={session.operator.mustChangePassword} />
      </div>
      <IntakeWizard />
    </>
  );
}
