"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message || "Sign-in did not succeed.");
        setPending(false);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Sign-in did not succeed.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
