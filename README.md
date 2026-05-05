# DevPilot AI

Build Faster. Review Smarter. Ship Better.

## Deployment

### Vercel (Frontend + API)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add `devpilotai.dev` as the production domain.
4. Set environment variables from `.env.example`, including `NEXTAUTH_URL=https://devpilotai.dev` and `APP_URL=https://devpilotai.dev`.
5. Add managed PostgreSQL (Supabase / Railway / Render) and set `DATABASE_URL` plus `DIRECT_URL`.
6. Configure OAuth callback URLs:
   - GitHub: `https://devpilotai.dev/api/auth/callback/github`
   - Google: `https://devpilotai.dev/api/auth/callback/google`
7. Run Prisma migration in build command or post-deploy:
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
- If `GROQ_API_KEY` is not present, AI modules return realistic demo outputs.
- The default AI runtime uses Groq's OpenAI-compatible API via `GROQ_API_KEY` and optional `GROQ_MODEL`.
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
  - Configure SMTP variables (`EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASS`, `EMAIL_FROM`) to send invite emails automatically
  - If not configured, invite creation still succeeds and returns a copyable invite link
  - Reminder job endpoint: `POST /api/team/invites/reminders` with header `Authorization: Bearer <CRON_SECRET>`
  - Sends reminder emails for pending invites expiring in under 24h (once per invite)

## Production Domain Checklist
- Set `NEXTAUTH_URL` and `APP_URL` to `https://devpilotai.dev`.
- Add `devpilotai.dev` in Vercel and verify DNS.
- Update GitHub and Google OAuth callbacks to the `devpilotai.dev` callback URLs.
- Use `hello@devpilotai.dev` or another verified sender for `EMAIL_FROM`.
- Rotate any SMTP app password that was copied into a shared file or chat.

