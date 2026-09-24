# Agency OS

Phase 1 marketing agency operating system. A person creates a project, enters the business in their own words, and submits a request. An orchestrator queues specialist workers. Workflow, agent, output, approval, campaign, and integration state is stored in SQLite and survives a reload.

Nothing in the agent runtime is tied to a previous client. Integrations are created as `NOT_CONNECTED`. Publishing is refused.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm install` creates `.env` from `.env.example` when it is missing, generates the Prisma client, and `npm run dev` creates the SQLite database.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file. Default `file:./dev.db` (path is relative to `prisma/`). |
| `OPENAI_API_KEY` | no | If set, Client Intelligence through Video Creative call OpenAI. |
| `ANTHROPIC_API_KEY` | no | Used when `OPENAI_API_KEY` is empty. |
| `OPENAI_MODEL` | no | Default `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | no | OpenAI-compatible base URL. Default `https://api.openai.com/v1`. |
| `ANTHROPIC_MODEL` | no | Default `claude-sonnet-4-5`. |
| `WORKER_INTERVAL_MS` | no | How often the database queue claims the next job. Default `1200`. |

If a key is set, Client Intelligence, Market Intelligence, Brand Studio, Market Strategy, Campaign Architect, Content Studio, and Video Creative call that provider. Content Studio asks for a platform-native hook, full caption, creative direction, and the project’s approved CTA. Posts are stored as `LLM`. The model is not given web access, so it must not invent statistics, awards, testimonials, or competitors. A claim that is not in the project record is stripped or the post is saved as `FAILED`. A failed API call is `FAILED` and is not replaced with a pretend model draft.

If neither key is set, the same pipeline still runs. Content objects are written from the fields on the project and labeled `GENERATED_WITHOUT_LLM`.

`OPENAI_API_KEY` wins when both keys are set. Orchestrator, Campaign Operations, Account & Integration, Campaign Intelligence, and Growth Optimization always read the database. They do not let a model mark an account connected or invent metrics.

## What the desk does

1. Create a project and business record.
2. Submit a natural-language request. A database job queue runs one specialist at a time.
3. Review client, research, brand, strategy, architecture, and content objects.
4. Approve, request a revision, or hold. Silence does not approve.
5. After approval, operations and integration readiness run and stop at activation. Campaign intelligence stays `BLOCKED` until you record an observed metric.
6. Connect and Authorize publish return `BLOCKED` and write an audit row. Status stays `NOT_CONNECTED`.

Leave the page and come back. Jobs continue from the `Job` table.

## Deferred (Phase 2)

- OAuth and credential storage for Meta, LinkedIn, TikTok, YouTube, X, Pinterest, email, Google Ads, and analytics
- External publishing and campaign activation
- Live web research and platform metric sync

## Stack

Next.js App Router, TypeScript, Tailwind, Prisma, SQLite. The worker starts with the Next.js server and polls the `Job` table.
