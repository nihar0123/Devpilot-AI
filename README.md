# DevPilot AI

Build Faster. Review Smarter. Ship Better.

## Deployment

### Vercel (Frontend + API)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Add managed PostgreSQL (Supabase / Railway / Render) and set `DATABASE_URL`.
5. Run Prisma migration in build command or post-deploy:
   - `npx prisma migrate deploy`
   - `npx prisma generate`

### Database Options
- Supabase Postgres
- Railway Postgres
- Render Postgres

### Local Setup
1. `npm install`
2. `cp .env.example .env`
3. Configure OAuth and DB env vars
4. `npx prisma migrate dev`
5. `npm run db:seed`
6. `npm run dev`

## Notes
- If `OPENAI_API_KEY` is not present, AI modules return realistic demo outputs.
- GitHub OAuth is configured through NextAuth.
- API routes are in `src/app/api`.
- Repo analytics supports:
  - Demo mode by default
  - Live GitHub mode via `/api/repo-analytics?repoUrl=<url>`
  - Higher GitHub API limits with optional `GITHUB_TOKEN`
- Enterprise scaffolding included:
  - Role-based team models (`OWNER/ADMIN/MEMBER/VIEWER`)
  - Team invite and member endpoints
  - Audit logging utility
  - Billing plan catalog and checkout bootstrap endpoint
- Invite emails:
  - Configure `RESEND_API_KEY` and `INVITE_FROM_EMAIL` to send invite emails automatically
  - If not configured, invite creation still succeeds and returns a copyable invite link
  - Reminder job endpoint: `POST /api/team/invites/reminders` with header `Authorization: Bearer <CRON_SECRET>`
  - Sends reminder emails for pending invites expiring in under 24h (once per invite)

