-- Add organization-scoped projects and simple team tasks.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "orgId" TEXT;

CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Project_orgId_idx" ON "Project"("orgId");
CREATE INDEX IF NOT EXISTS "Task_orgId_projectId_idx" ON "Task"("orgId", "projectId");
CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Project_orgId_fkey'
  ) THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_orgId_fkey'
  ) THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_projectId_fkey'
  ) THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_assigneeId_fkey'
  ) THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey"
      FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_createdById_fkey'
  ) THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Task_completedById_fkey'
  ) THEN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_completedById_fkey"
      FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
