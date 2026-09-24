import { prisma } from "./db";

export async function audit(input: {
  projectId: string;
  workflowId?: string | null;
  actor: string;
  action: string;
  detail: string;
}) {
  await prisma.auditLog.create({
    data: {
      projectId: input.projectId,
      workflowId: input.workflowId ?? null,
      actor: input.actor,
      action: input.action,
      detail: input.detail,
    },
  });
}
