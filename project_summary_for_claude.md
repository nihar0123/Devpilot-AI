# DevPilot AI: Project Overview

## What is DevPilot AI?
DevPilot AI is a comprehensive Next.js web application designed to be an AI-powered assistant and management dashboard for developers and engineering teams. It integrates repository data, AI-driven code analysis, team collaboration, and project management into a single cohesive platform.

### Tech Stack
- **Framework**: Next.js (App Router)
- **Database & ORM**: PostgreSQL, Prisma
- **Authentication**: NextAuth.js (Google OAuth, Email via Nodemailer with Gmail SMTP)
- **UI/Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Data Visualization**: Recharts
- **AI Integration**: OpenAI SDK (for test generation, code analysis, etc.)

## Core Features & Data Model
- **Organizations & Teams**: Role-based access control, team invites (via email), and organization-level dashboards.
- **Projects & Repositories**: Linking to GitHub, fetching commit history, and generating real-time analytics (e.g., File Change Heatmaps).
- **AI-Powered Workflows**:
  - `CodeAnalysis`: Scores code quality, finds security issues, suggests refactors.
  - `TestSuite`: Generates automated tests, edge cases, and mocks based on project code.
  - `Documentation`: Auto-generates READMEs, setup guides, and API docs.
  - `BugReport`: Analyzes code context to provide severity ratings and suggested fixes.
- **Task Management**: Tasks tied to projects and assigned to team members.

## Recent Milestones & Completed Work
Here is a summary of the most recent work we've accomplished together:

1. **Authentication & Team Onboarding**
   - Implemented full-stack authentication using Google OAuth and Email providers.
   - Migrated email infrastructure to Nodemailer/Gmail SMTP.
   - Built a complete team invitation workflow (invite generation, pending states, secure acceptance/revocation logic).

2. **GitHub Analytics Dashboard**
   - Connected the application to GitHub APIs to visualize actual repository data.
   - Implemented features like the Developer Leaderboard and File Change Heatmaps using dynamic aggregations based on commit history.
   - Designed the logic to separate personal ("solo") projects from team-wide organization projects.

3. **Production Deployment & Vercel Configuration**
   - Successfully deployed the application to Vercel (`devpilotai.dev`).
   - Resolved complex Next.js build-time errors related to Turbopack and middleware configuration.
   - Fixed route protection issues to ensure public routes are accessible while securing the dashboard.

4. **UI/UX & Accessibility**
   - Refined the design system, focusing on contrast and accessibility across Light and Dark modes.
   - Fixed CSS variable conflicts and global theme-aware styling to ensure a premium, modern feel.

## Current State
The platform is successfully deployed and functional. Core auth, database schema, team management, and baseline analytics are complete. We are currently focusing on the AI generation features (e.g., test generation) and refining the platform's workflows.
