import Link from "next/link";

export function PasswordNotice({ mustChange }: { mustChange: boolean }) {
  if (!mustChange) return null;
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      This Operator still uses the default password.{" "}
      <Link href="/account" className="font-semibold underline">
        Change it
      </Link>{" "}
      before anyone else uses this machine.
    </p>
  );
}
