import { StatusPill } from "./status-pill";
import type { ProjectState } from "@/lib/state";

type Output = ProjectState["outputs"][number];

export function OutputView({ output }: { output: Output }) {
  return (
    <article className="rounded-xl border border-line bg-panel p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-2xl">{output.title}</h3>
        <StatusPill value={output.status} />
        <StatusPill value={output.generationMode} />
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{output.summary}</p>
      <div className="mt-4 text-sm">{renderBody(output.body)}</div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs uppercase tracking-wide text-ink-soft">Stored JSON</summary>
        <pre className="mt-2 overflow-auto rounded-md bg-ink px-3 py-3 text-xs leading-5 text-paper">{JSON.stringify(output.body, null, 2)}</pre>
      </details>
    </article>
  );
}

function renderBody(body: Record<string, unknown>) {
  const entries = Object.entries(body);
  if (entries.length === 0) return <p>No structured fields were stored.</p>;
  return (
    <div className="grid gap-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <p className="text-xs uppercase tracking-wide text-ink-soft">{key.replaceAll("_", " ")}</p>
          <div className="mt-1">{renderValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

function renderValue(value: unknown): React.ReactNode {
  if (value == null) return <p>UNKNOWN</p>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <p className="whitespace-pre-wrap leading-6">{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <p>None.</p>;
    if (value.every((item) => typeof item === "string" || typeof item === "number")) {
      return (
        <ul className="list-disc pl-5 leading-6">
          {value.map((item, index) => (
            <li key={index}>{String(item)}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="grid gap-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-md border border-line bg-white px-3 py-2">
            {item && typeof item === "object" ? renderBody(item as Record<string, unknown>) : String(item)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") return renderBody(value as Record<string, unknown>);
  return <p>{String(value)}</p>;
}
