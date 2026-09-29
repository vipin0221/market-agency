import Link from "next/link";
import { Banner } from "@/components/ui";

export function PasswordNotice({ mustChange }: { mustChange: boolean }) {
  if (!mustChange) return null;
  return (
    <Banner tone="warning">
      This Operator still uses the default password.{" "}
      <Link href="/account" className="font-semibold underline">
        Change it
      </Link>{" "}
      before anyone else uses this machine.
    </Banner>
  );
}
