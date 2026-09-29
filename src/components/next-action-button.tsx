"use client";

import Link from "next/link";
import { useState } from "react";
import { primaryButtonClass } from "@/components/ui";
import type { NextAction } from "@/lib/journey";

export function NextActionButton({
  action,
  projectId,
  onDone,
}: {
  action: NextAction;
  projectId: string;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(url: string) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(url, { method: "POST" });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) setError(data?.message || "That did not run.");
      else onDone?.();
    } catch {
      setError("That did not run.");
    } finally {
      setPending(false);
    }
  }

  const className = primaryButtonClass;

  return (
    <div>
      {action.kind === "retry" ? (
        <button type="button" disabled={pending} onClick={() => void run(`/api/projects/${projectId}/retry`)} className={className}>
          {pending ? "Queuing retry…" : action.cta}
        </button>
      ) : action.kind === "nudge" ? (
        <button type="button" disabled={pending} onClick={() => void run("/api/worker/tick")} className={className}>
          {pending ? "Running the queue…" : action.cta}
        </button>
      ) : action.href.startsWith("#") ? (
        <a href={action.href} className={className}>
          {action.cta}
        </a>
      ) : (
        <Link href={action.href} className={className}>
          {action.cta}
        </Link>
      )}
      {error ? <p className="mt-3 text-sm text-rose-800">{error}</p> : null}
    </div>
  );
}
