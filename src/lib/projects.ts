import { z } from "zod";
import { INTEGRATION_CATALOG } from "./catalog";
import { audit } from "./audit";
import { prisma } from "./db";
import { createWorkflow, startWorker } from "./worker";

export const clientFields = z.object({
  projectName: z.string().trim().min(1, "Project name is required.").max(120),
  businessName: z.string().trim().min(1, "Business name is required.").max(160),
  industry: z.string().trim().max(160).optional().default(""),
  audience: z.string().trim().max(400).optional().default(""),
  geography: z.string().trim().max(160).optional().default(""),
  goals: z.string().trim().max(800).optional().default(""),
  offers: z.string().trim().max(800).optional().default(""),
  channels: z.string().trim().max(400).optional().default(""),
  budget: z.string().trim().max(160).optional().default(""),
  constraints: z.string().trim().max(800).optional().default(""),
  website: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  primaryCta: z.string().trim().max(160).optional().default(""),
  funnel: z.string().trim().max(300).optional().default(""),
  request: z.string().trim().max(8000).optional().default(""),
});

export async function createProject(input: z.infer<typeof clientFields>) {
  const project = await prisma.project.create({
    data: {
      name: input.projectName,
      client: {
        create: {
          businessName: input.businessName,
          industry: input.industry,
          audience: input.audience,
          geography: input.geography,
          goals: input.goals,
          offers: input.offers,
          channels: input.channels,
          budget: input.budget,
          constraints: input.constraints,
          website: input.website,
          notes: input.notes,
          primaryCta: input.primaryCta,
          funnel: input.funnel,
        },
      },
      integrations: {
        create: INTEGRATION_CATALOG.map((item) => ({
          provider: item.provider,
          label: item.label,
          status: "NOT_CONNECTED",
          detail: "Phase 1 does not start OAuth. Status stays NOT_CONNECTED.",
        })),
      },
    },
  });
  await audit({
    projectId: project.id,
    actor: "human",
    action: "PROJECT_CREATED",
    detail: `${input.projectName} / ${input.businessName}`,
  });
  let workflowId: string | null = null;
  if (input.request) {
    const workflow = await createWorkflow(project.id, input.request);
    workflowId = workflow.id;
  }
  startWorker();
  return { projectId: project.id, workflowId };
}

export async function updateClient(projectId: string, input: z.infer<typeof clientFields>) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { client: true } });
  if (!project?.client) return null;
  await prisma.project.update({ where: { id: projectId }, data: { name: input.projectName } });
  await prisma.client.update({
    where: { projectId },
    data: {
      businessName: input.businessName,
      industry: input.industry,
      audience: input.audience,
      geography: input.geography,
      goals: input.goals,
      offers: input.offers,
      channels: input.channels,
      budget: input.budget,
      constraints: input.constraints,
      website: input.website,
      notes: input.notes,
      primaryCta: input.primaryCta,
      funnel: input.funnel,
    },
  });
  await audit({
    projectId,
    actor: "human",
    action: "CLIENT_UPDATED",
    detail: "Business fields were edited. Existing outputs were not rewritten.",
  });
  return projectId;
}
