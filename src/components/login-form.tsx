"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banner, fieldClass, primaryButtonClass } from "@/components/ui";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message || "That email or password was not accepted. Try again.");
        setPending(false);
        return;
      }
      router.replace(nextPath);
      router.refresh();
      window.setTimeout(() => {
        setPending(false);
        setError("Sign-in did not finish. Try again.");
      }, 8000);
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === "AbortError";
      setError(aborted ? "Sign-in timed out. Check the password and try again." : "Sign-in did not succeed. Try again.");
      setPending(false);
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Email</span>
        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </label>
      {error ? (
        <Banner tone="error" role="alert">
          {error}
        </Banner>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
