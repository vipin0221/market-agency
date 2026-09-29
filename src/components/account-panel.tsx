"use client";

import { useState } from "react";

export function AccountPanel({ email }: { email: string }) {
  return (
    <div className="mt-6 grid gap-6">
      <PasswordForm email={email} />
      <OperatorForm />
    </div>
  );
}

function PasswordForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) setError(data?.message || "The password was not changed.");
    else {
      setMessage(data?.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-panel p-5 shadow-card">
      <h2 className="font-serif text-3xl">Change password</h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">Signed in as {email}. The new password replaces the one stored for this Operator.</p>
      <div className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Current password</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">New password</span>
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-800">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-pine">{message}</p> : null}
      <button type="submit" disabled={pending} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

function OperatorForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/auth/operators", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    const data = (await response.json().catch(() => null)) as { message?: string; email?: string } | null;
    if (!response.ok) setError(data?.message || "The account was not created.");
    else {
      setMessage(`${data?.email || email} can sign in with the password you just set.`);
      setEmail("");
      setName("");
      setPassword("");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-panel p-5 shadow-card">
      <h2 className="font-serif text-3xl">Add an operator</h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">A second person can sign in on this machine. There is no cloud directory.</p>
      <div className="mt-4 grid gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            required
            type="email"
            autoComplete="off"
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
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-800">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-pine">{message}</p> : null}
      <button type="submit" disabled={pending} className="mt-4 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
        {pending ? "Creating…" : "Create operator"}
      </button>
    </form>
  );
}
