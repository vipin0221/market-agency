"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CHANNELS } from "@/lib/catalog";

type Values = {
  projectName: string;
  businessName: string;
  industry: string;
  website: string;
  geography: string;
  audience: string;
  offers: string;
  goals: string;
  primaryCta: string;
  funnel: string;
  request: string;
  budget: string;
  constraints: string;
  notes: string;
};

const empty: Values = {
  projectName: "",
  businessName: "",
  industry: "",
  website: "",
  geography: "",
  audience: "",
  offers: "",
  goals: "",
  primaryCta: "",
  funnel: "",
  request: "",
  budget: "",
  constraints: "",
  notes: "",
};

const steps = [
  { title: "Brand", lede: "Who this work is for." },
  { title: "Offer & audience", lede: "What you sell, and who it is for. Blank fields stay unknown." },
  { title: "Goal & ask", lede: "What you want this round to do." },
  { title: "Channels & limits", lede: "Pick at least one channel. Budget and limits can wait." },
];

export function IntakeWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(empty);
  const [channels, setChannels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function messageFor(index: number) {
    if (index === 0 && !values.businessName.trim()) return "Add the business name to continue.";
    if (index === 2 && !values.request.trim()) return "Describe the marketing work you want.";
    if (index === 3 && channels.length === 0) return "Pick at least one channel.";
    return null;
  }

  function firstInvalid() {
    for (const index of [0, 2, 3]) {
      if (messageFor(index)) return index;
    }
    return null;
  }

  async function create() {
    const invalid = firstInvalid();
    if (invalid != null) {
      setStep(invalid);
      setError(messageFor(invalid));
      return;
    }
    setPending(true);
    setError(null);
    const channelText = CHANNELS.filter((channel) => channels.includes(channel.id))
      .map((channel) => channel.label)
      .join(", ");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...values,
        projectName: values.projectName.trim() || values.businessName.trim(),
        channels: channelText,
      }),
    });
    const data = (await response.json()) as { message?: string; projectId?: string };
    if (!response.ok || !data.projectId) {
      setError(data.message || "The brand was not started.");
      setPending(false);
      return;
    }
    router.push(`/projects/${data.projectId}`);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problem = messageFor(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    void create();
  }

  const current = steps[step];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Agency OS
        </Link>
        <Link href="/" className="text-sm text-ink-soft">
          Brands
        </Link>
      </div>
      <h1 className="mt-6 font-serif text-4xl">Add a brand</h1>
      <p className="mt-2 text-sm leading-6 text-ink-soft">Business name, the ask, and one channel are required. Everything else can wait.</p>
      <ol className="mt-6 flex flex-wrap gap-2">
        {steps.map((item, index) => {
          const active = index === step;
          return (
            <li key={item.title}>
              <button
                type="button"
                disabled={index > step}
                onClick={() => {
                  if (index < step) {
                    setError(null);
                    setStep(index);
                  }
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-ink text-paper" : "bg-panel text-ink-soft"} disabled:opacity-50`}
              >
                {index + 1} {item.title}
              </button>
            </li>
          );
        })}
      </ol>
      <form onSubmit={onSubmit} className="mt-4 rounded-2xl border border-line bg-panel p-5 shadow-card">
        <h2 className="font-serif text-3xl">{current.title}</h2>
        <p className="mt-1 text-sm text-ink-soft">{current.lede}</p>
        <div className="mt-5 grid gap-4">
          {step === 0 ? (
            <>
              <Field label="Project name" value={values.projectName} onChange={(value) => set("projectName", value)} placeholder="Shown in your brand list" maxLength={120} hint="Leave blank to use the business name." />
              <Field label="Business name" value={values.businessName} onChange={(value) => set("businessName", value)} required maxLength={160} />
              <Field label="Industry" value={values.industry} onChange={(value) => set("industry", value)} maxLength={160} />
              <Field label="Website" value={values.website} onChange={(value) => set("website", value)} maxLength={300} />
              <Field label="Geography" value={values.geography} onChange={(value) => set("geography", value)} maxLength={160} />
            </>
          ) : null}
          {step === 1 ? (
            <>
              <Area label="Audience" value={values.audience} onChange={(value) => set("audience", value)} maxLength={400} />
              <Area label="Offer" value={values.offers} onChange={(value) => set("offers", value)} maxLength={800} />
            </>
          ) : null}
          {step === 2 ? (
            <>
              <Area label="Goal" value={values.goals} onChange={(value) => set("goals", value)} maxLength={800} />
              <Field label="Primary CTA" value={values.primaryCta} onChange={(value) => set("primaryCta", value)} maxLength={160} />
              <Field label="Funnel" value={values.funnel} onChange={(value) => set("funnel", value)} placeholder="Awareness, Visit" maxLength={300} />
              <Area
                label="Marketing request"
                value={values.request}
                onChange={(value) => set("request", value)}
                required
                rows={5}
                maxLength={8000}
                placeholder="Describe the work in plain language."
              />
            </>
          ) : null}
          {step === 3 ? (
            <>
              <fieldset>
                <legend className="text-sm font-medium">Channels *</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CHANNELS.map((channel) => {
                    const selected = channels.includes(channel.id);
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setChannels((current) => (current.includes(channel.id) ? current.filter((id) => id !== channel.id) : [...current, channel.id]))
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm ${selected ? "border-ink bg-ink text-paper" : "border-line bg-white"}`}
                      >
                        {channel.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <Field label="Budget" value={values.budget} onChange={(value) => set("budget", value)} maxLength={160} />
              <Area label="Constraints" value={values.constraints} onChange={(value) => set("constraints", value)} maxLength={800} />
              <Area label="Notes" value={values.notes} onChange={(value) => set("notes", value)} maxLength={2000} />
            </>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
              className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
          ) : (
            <Link href="/" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold">
              Back
            </Link>
          )}
          <button type="submit" disabled={pending} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
            {pending ? "Starting…" : step === steps.length - 1 ? "Start this brand" : "Continue"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
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
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
      />
      {hint ? <span className="mt-1 block text-xs text-ink-soft">{hint}</span> : null}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 3,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        required={required}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
      />
    </label>
  );
}
