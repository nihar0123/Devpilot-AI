import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function recordActivity({
  orgId,
  userId,
  action,
  target,
  metadata,
}: {
  orgId?: string | null;
  userId?: string | null;
  action: string;
  target?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: { orgId, userId, action, target, metadata },
    });
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
}
