export const commitActivityData = [
  { week: "Week 1", commits: 22 },
  { week: "Week 2", commits: 27 },
  { week: "Week 3", commits: 24 },
  { week: "Week 4", commits: 31 },
  { week: "Week 5", commits: 29 },
  { week: "Week 6", commits: 36 },
  { week: "Week 7", commits: 33 },
  { week: "Week 8", commits: 42 },
  { week: "Week 9", commits: 39 },
  { week: "Week 10", commits: 46 },
  { week: "Week 11", commits: 41 },
  { week: "Week 12", commits: 48 },
];

export const qualityTrendData = Array.from({ length: 30 }, (_, index) => ({
  day: `Day ${index + 1}`,
  score: 65 + Math.min(index, 17) + ((index % 4) - 1),
  teamAverage: 61 + Math.floor(index * 0.45),
}));

export const heatmapData = Array.from({ length: 16 * 7 }, (_, index) => {
  const intensity = [0, 1, 2, 3, 5, 7, 10, 12][(index * 3 + 2) % 8];
  const date = new Date(2026, 0, 5 + index);
  return { id: index, date: date.toISOString().split("T")[0], changes: intensity };
});

export const bugHotspotData = [
  { path: "src/lib/ai/codeReview.ts", bugs: 7, changes: 18, riskLevel: "Critical" },
  { path: "src/app/api/team/invites/route.ts", bugs: 5, changes: 14, riskLevel: "High" },
  { path: "src/components/dashboard/Sidebar.tsx", bugs: 4, changes: 12, riskLevel: "High" },
  { path: "src/app/(dashboard)/dashboard/tests/page.tsx", bugs: 4, changes: 11, riskLevel: "Medium" },
  { path: "src/app/(auth)/login/page.tsx", bugs: 3, changes: 10, riskLevel: "Medium" },
  { path: "src/app/api/repo-analytics/route.ts", bugs: 3, changes: 9, riskLevel: "Medium" },
  { path: "src/components/ui/CodeInput.tsx", bugs: 2, changes: 6, riskLevel: "Low" },
  { path: "src/app/page.tsx", bugs: 1, changes: 5, riskLevel: "Low" },
];

export const radarData = [
  { metric: "Code Reviews", you: 86, team: 72 },
  { metric: "Bugs Found", you: 79, team: 68 },
  { metric: "Tests Written", you: 83, team: 71 },
  { metric: "Docs Generated", you: 88, team: 65 },
  { metric: "Commits", you: 76, team: 69 },
];

export const recentActivityData = [
  { id: "1", type: "code_review", description: "Code reviewed in API Gateway", time: "2 hours ago" },
  { id: "2", type: "docs_generated", description: "README generated for Billing Service", time: "5 hours ago" },
  { id: "3", type: "bug_found", description: "Critical bug found in invite token validation", time: "7 hours ago" },
  { id: "4", type: "test_generated", description: "Jest suite generated for analytics helpers", time: "9 hours ago" },
  { id: "5", type: "code_review", description: "Quality score improved for Dashboard Layout", time: "1 day ago" },
  { id: "6", type: "docs_generated", description: "Setup guide refreshed for new contributors", time: "1 day ago" },
  { id: "7", type: "bug_found", description: "Null-state bug found in pricing toggle", time: "2 days ago" },
  { id: "8", type: "test_generated", description: "Vitest coverage expanded for auth callbacks", time: "2 days ago" },
  { id: "9", type: "code_review", description: "Security review completed for API routes", time: "3 days ago" },
  { id: "10", type: "docs_generated", description: "Module summary added for AI services", time: "3 days ago" },
];

export const leaderboardData = [
  { id: "1", name: "Nihar Sharma", role: "OWNER", score: 96 },
  { id: "2", name: "Aarav Mehta", role: "ADMIN", score: 91 },
  { id: "3", name: "Sana Patel", role: "MEMBER", score: 88 },
  { id: "4", name: "Ishaan Rao", role: "MEMBER", score: 84 },
  { id: "5", name: "Maya Singh", role: "VIEWER", score: 77 },
];

export const sprintProgressData = {
  name: "Sprint 23 - Performance Improvements",
  dates: "Apr 14 - Apr 28, 2025",
  completed: 12,
  total: 18,
  tasks: [
    { label: "Stabilize GitHub OAuth callback", complete: true },
    { label: "Ship responsive dashboard sidebar", complete: true },
    { label: "Improve AI route validation", complete: true },
    { label: "Finish analytics hotspot visualization", complete: false },
    { label: "Add billing usage card polish", complete: false },
  ],
};

export const docsTemplates = {
  readme: (projectName: string) => `# ${projectName}\n\n${projectName} helps engineering teams automate code review, documentation, bug detection, and test generation from one dashboard.\n\n## Highlights\n\n- AI-assisted code reviews with severity scoring\n- Documentation generation for onboarding and APIs\n- Bug finder with security-aware suggestions\n- Test generation across JavaScript, TypeScript, and Python\n\n## Quick Start\n\n1. Install dependencies with \`npm install\`.\n2. Copy \`.env.example\` to \`.env.local\`.\n3. Run \`npx prisma generate\` and migrate your database.\n4. Start the app with \`npm run dev\`.`,
  setupGuide: (projectName: string) => `# ${projectName} Setup Guide\n\n## Prerequisites\n\n- Node.js 20.9 or newer\n- PostgreSQL database\n- GitHub OAuth app for local development\n\n## Environment Variables\n\nCreate \`.env.local\` and provide \`NEXTAUTH_SECRET\`, \`DATABASE_URL\`, and OAuth provider values.\n\n## Local Development\n\n\`\`\`bash\nnpm install\nnpx prisma generate\nnpm run dev\n\`\`\`\n\nOpen https://devpilotai.dev and sign in to reach the dashboard.`,
  apiDocs: (projectName: string) => `# ${projectName} API Reference\n\n## POST /api/code-review\nAnalyzes pasted code and returns a quality score, issues list, refactored code, and security findings.\n\n## POST /api/bug-finder\nScans code for critical, high, medium, and low severity bugs.\n\n## POST /api/docs-generator\nGenerates README, setup guide, API docs, and module summary markdown.\n\n## POST /api/test-generator\nProduces generated tests, edge-case counts, and mock usage guidance.`,
  moduleSummary: (projectName: string) => `# ${projectName} Module Summary\n\n- Marketing pages: landing, pricing, docs, and legal pages\n- Dashboard: overview, AI tools, analytics, team, and settings\n- API routes: protected AI endpoints with resilient demo fallbacks\n- Shared UI: cards, badges, dialog, code blocks, and charts\n`,
};
