# Agency OS

Phase 1 marketing workspace you can run on your own machine. Add a brand, describe the work, and review the posts. The same path fits one brand or many. Campaigns are optional. Integrations are created as `NOT_CONNECTED`, and posting is refused.

Grok Bot is not required. Agency OS has its own sign-in, brand list, journey, and in-process specialist worker. Leave the model keys empty and the pipeline still runs from the fields on the brand.

Nothing in the agent runtime is tied to a previous client. Workflow, output, approval, campaign, and integration state is stored in SQLite and survives a reload.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be asked to sign in, then you land on the brand list.

`npm install` creates `.env` from `.env.example` when it is missing, generates the Prisma client, and `npm run dev` creates the SQLite database. `.env` stays out of git.

`npm run typecheck` checks TypeScript. `npm run build` creates a production build.

## Sign in

The first launch creates one Operator if the database has none. The password is stored as a scrypt hash. The session is an httpOnly cookie.

| | |
| --- | --- |
| Email | `operator@localhost` |
| Password | `change-me` |

Set `OPERATOR_EMAIL` and `OPERATOR_PASSWORD` in `.env` before the first launch to choose different values. Those variables are used only to create the first account. Changing them later does not reset a password that is already stored. After you sign in, open Account to change the password or add another operator. There is no cloud sign-in.

Unauthenticated visitors cannot open brands or call the project APIs.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file. Default `file:./dev.db` (path is relative to `prisma/`). |
| `OPERATOR_EMAIL` | no | Email for the first Operator. Default `operator@localhost`. |
| `OPERATOR_PASSWORD` | no | Password for the first Operator. Default `change-me`. Used only when no Operator exists yet. |
| `COOKIE_SECURE` | no | Set `true` only behind HTTPS. Leave `false` for local http so the session cookie is stored. |
| `OPENAI_API_KEY` | no | If set, Client Intelligence through Video Creative call OpenAI. |
| `ANTHROPIC_API_KEY` | no | Used when `OPENAI_API_KEY` is empty. |
| `OPENAI_MODEL` | no | Default `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | no | OpenAI-compatible base URL. Default `https://api.openai.com/v1`. |
| `ANTHROPIC_MODEL` | no | Default `claude-sonnet-4-5`. |
| `WORKER_INTERVAL_MS` | no | How often the database queue claims the next job. Default `1200`. |

If a key is set, Client Intelligence, Market Intelligence, Brand Studio, Market Strategy, Campaign Architect, Content Studio, and Video Creative call that provider. Content Studio asks for a platform-native hook, full caption, creative direction, and the project’s approved CTA. Posts are stored as `LLM`. The model is not given web access, so it must not invent statistics, awards, testimonials, or competitors. A claim that is not in the project record is stripped or the post is saved as `FAILED`. A failed API call is `FAILED` and is not replaced with a pretend model draft.

If neither key is set, the same pipeline still runs. Content objects are written from the fields on the project and labeled `GENERATED_WITHOUT_LLM`.

`OPENAI_API_KEY` wins when both keys are set. Orchestrator, Campaign Operations, Account & Integration, Campaign Intelligence, and Growth Optimization always read the database. They do not let a model mark an account connected or invent metrics.

## Default path

Sign in, then open [http://localhost:3000](http://localhost:3000).

- **Home** lists brands. If there is only one, it opens directly. The next step on a brand is always labeled Next.
- **Add a brand** is a short intake. Business name, the marketing request, and at least one channel are required. Other fields can be left blank and stay unknown. Starting writes drafts only.
- **Overview** shows one next action, the pipeline state (queued, running, failed, or needs you), journey progress, and the latest posts.
- **Journey** walks Brand → Research → Strategy → Content → Review → Connect → Campaigns → Reports. The current step is marked Next. Each step opens the deliverable.
- **Content** is the post preview.
- **Review** is where you approve, ask for a revision, or hold. Silence is not approval, and nothing is posted from this page.
- **Calendar** shows a week or a month. A post is placed on a day only when a publish time is already stored.
- **Connect** lists accounts as `NOT_CONNECTED`. Sign-in is not available in this version and does not post.
- **Campaigns** are optional and are not activated. Organic posts do not require one. The posting check stays refused.
- **Reports** show results you record. None are imported.

If a specialist fails, Overview names the step, shows the error, and offers **Retry this step**. Retry runs that step again. It does not invent a draft, a metric, or a connected account. A step that stays queued can be nudged with **Run the queue now**.

## Advanced

Operator tools stay in the sidebar under Advanced. Nothing was removed:

- AI workspace `/projects/[id]/workspace`
- Agents `/projects/[id]/agents`
- Outputs `/projects/[id]/outputs`
- Audit `/projects/[id]/audit`
- Approval log `/projects/[id]/approvals`
- Integration records `/projects/[id]/integrations`

## What the work does

1. Create a brand and business record, and queue the request.
2. A database job queue runs one specialist at a time.
3. Read brand, research, strategy, and the posts.
4. Approve, request a revision, or hold. Silence does not approve.
5. After approval, operations and integration readiness run and stop at activation. Reports stay empty until you record an observed result.
6. Connect and the posting check return `BLOCKED` and write an audit row. Status stays `NOT_CONNECTED`. A failed job stays `FAILED` until you retry it or start another request.

Leave the page and come back. Jobs continue from the `Job` table.

## Deferred (Phase 2)

- OAuth and credential storage for Meta, LinkedIn, TikTok, YouTube, X, Pinterest, email, Google Ads, and analytics
- External publishing and campaign activation
- Live web research and platform metric sync

## Stack

Next.js App Router, TypeScript, Tailwind, Prisma, SQLite. The worker starts with the Next.js server and polls the `Job` table.
