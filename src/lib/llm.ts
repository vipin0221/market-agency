export class LlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmError";
  }
}

export function llmStatus() {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return {
      configured: true,
      provider: "openai" as const,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return {
      configured: true,
      provider: "anthropic" as const,
      model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5",
    };
  }
  return { configured: false, provider: null, model: null };
}

export async function llmJson(system: string, user: string, options?: { temperature?: number }) {
  const status = llmStatus();
  if (!status.configured || !status.provider) {
    throw new LlmError("LLM_NOT_CONFIGURED");
  }
  const temperature = options?.temperature ?? 0.4;
  try {
    return await complete(status.provider, system, user, temperature);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/429|500|502|503|timeout|fetch failed|network/i.test(message)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 700));
    return complete(status.provider, system, user, temperature);
  }
}

function complete(provider: "openai" | "anthropic", system: string, user: string, temperature: number) {
  if (provider === "openai") return completeOpenAI(system, user, temperature);
  return completeAnthropic(system, user, temperature);
}

async function completeOpenAI(system: string, user: string, temperature: number) {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };
  if (!response.ok) {
    throw new LlmError(payload.error?.message || `OpenAI request failed (${response.status})`);
  }
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new LlmError("OpenAI returned an empty response.");
  return { text, provider: "openai" };
}

async function completeAnthropic(system: string, user: string, temperature: number) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5",
      max_tokens: 8000,
      temperature,
      system,
      messages: [{ role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type: string; text?: string }[];
  };
  if (!response.ok) {
    throw new LlmError(payload.error?.message || `Anthropic request failed (${response.status})`);
  }
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new LlmError("Anthropic returned an empty response.");
  return { text, provider: "anthropic" };
}

export function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : trimmed;
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new LlmError("LLM response was not a JSON object.");
  }
  return parsed as Record<string, unknown>;
}
