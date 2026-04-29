/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@devpilot.ai" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "demo@devpilot.ai",
      image: "https://avatars.githubusercontent.com/u/583231?v=4",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project-id" },
    update: {},
    create: {
      id: "demo-project-id",
      userId: user.id,
      name: "DevPilot Web",
      repoUrl: "https://github.com/example/devpilot-ai",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { id: "demo-org-id" },
    update: {},
    create: {
      id: "demo-org-id",
      name: "DevPilot Team",
      ownerId: user.id,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  await prisma.subscription.upsert({
    where: { organizationId: organization.id },
    update: { plan: "pro", status: "ACTIVE" },
    create: {
      organizationId: organization.id,
      userId: user.id,
      plan: "pro",
      status: "ACTIVE",
      provider: "stripe",
      providerRef: "sub_demo_001",
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { organizationId: organization.id },
  });

  await prisma.analytics.create({
    data: { projectId: project.id, commits: 42, prs: 16, qualityScore: 89 },
  });

  await prisma.codeAnalysis.create({
    data: {
      projectId: project.id,
      score: 89,
      suggestions: [{ title: "Extract utility", detail: "Split parser into smaller functions." }],
      securityIssues: [{ issue: "Validate URL input" }],
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

