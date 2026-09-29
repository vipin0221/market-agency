import Link from "next/link";
import { primaryButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh min-w-0 max-w-lg flex-col justify-center overflow-x-clip px-4 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Agency OS</p>
      <h1 className="mt-3 break-words font-serif text-3xl leading-tight sm:text-4xl">That page is not in this workspace.</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">Next: return to your brands. Nothing was changed.</p>
      <Link href="/" className={`mt-6 w-fit ${primaryButtonClass}`}>
        Back to brands
      </Link>
    </main>
  );
}
