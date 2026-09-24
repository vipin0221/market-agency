"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Values = {
  projectName: string;
  businessName: string;
  industry: string;
  audience: string;
  geography: string;
  goals: string;
  offers: string;
  channels: string;
  budget: string;
  constraints: string;
  website: string;
  notes: string;
  primaryCta: string;
  funnel: string;
  request: string;
};

const empty: Values = {
  projectName: "",
  businessName: "",
  industry: "",
  audience: "",
  geography: "",
  goals: "",
  offers: "",
  channels: "",
  budget: "",
  constraints: "",
  website: "",
  notes: "",
  primaryCta: "",
  funnel: "",
  request: "",
};

export function ClientForm({
  mode,
  projectId,
  initial,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<Values>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ ...empty, ...initial, request: mode === "create" ? initial?.request || "" : "" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const endpoint = mode === "create" ? "/api/projects" : `/api/projects/${projectId}`;
    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as { message?: string; projectId?: string };
    if (!response.ok) {
      setError(data.message || "The project was not saved.");
      setPending(false);
      return;
    }
    if (mode === "create" && data.projectId) {
      router.push(`/projects/${data.projectId}/workspace`);
      return;
    }
    setMessage("Business fields saved. Earlier outputs were not rewritten.");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project name" value={values.projectName} onChange={(value) => set("projectName", value)} required />
        <Field label="Business name" value={values.businessName} onChange={(value) => set("businessName", value)} required />
        <Field label="Industry" value={values.industry} onChange={(value) => set("industry", value)} />
        <Field label="Geography" value={values.geography} onChange={(value) => set("geography", value)} />
        <Field label="Audience" value={values.audience} onChange={(value) => set("audience", value)} />
        <Field label="Primary CTA" value={values.primaryCta} onChange={(value) => set("primaryCta", value)} />
        <Field label="Channels" value={values.channels} onChange={(value) => set("channels", value)} placeholder="Instagram, Email" />
        <Field label="Funnel" value={values.funnel} onChange={(value) => set("funnel", value)} placeholder="Awareness, Visit" />
        <Field label="Budget" value={values.budget} onChange={(value) => set("budget", value)} />
        <Field label="Website" value={values.website} onChange={(value) => set("website", value)} />
      </div>
      <Area label="Offer" value={values.offers} onChange={(value) => set("offers", value)} />
      <Area label="Goal" value={values.goals} onChange={(value) => set("goals", value)} />
      <Area label="Constraints" value={values.constraints} onChange={(value) => set("constraints", value)} />
      <Area label="Notes" value={values.notes} onChange={(value) => set("notes", value)} />
      {mode === "create" ? (
        <Area
          label="Marketing request"
          value={values.request}
          onChange={(value) => set("request", value)}
          placeholder="Describe the work in plain language. Name channels if the channel field is empty."
          rows={5}
        />
      ) : null}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          {pending ? "Saving…" : mode === "create" ? "Create project" : "Save business info"}
        </button>
        {message ? <p className="text-sm text-pine">{message}</p> : null}
        {error ? <p className="text-sm text-rose-800">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
      />
    </label>
  );
}
