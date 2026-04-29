export function teamInviteTemplate({
  inviteUrl,
  orgName,
  role,
  invitedBy,
}: {
  inviteUrl: string
  orgName: string
  role: string
  invitedBy: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f172a;
                  border-radius:12px;border:1px solid #1e2a45;overflow:hidden;">
        
        <!-- Header -->
        <div style="background:#7c3aed;padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">
            DevPilot AI
          </h1>
          <p style="color:#ddd6fe;margin:8px 0 0;font-size:14px;">
            AI-Powered Developer Productivity Suite
          </p>
        </div>

        <!-- Body -->
        <div style="padding:40px 32px;">
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">
            You have been invited to join ${orgName}
          </h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 8px;">
            <strong style="color:#a78bfa;">${invitedBy}</strong> 
            has invited you to join their team on DevPilot AI 
            as a <strong style="color:#a78bfa;">${role}</strong>.
          </p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
            Click the button below to accept your invitation and 
            get started.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin:32px 0;">
            <a href="${inviteUrl}"
               style="background:#7c3aed;color:#ffffff;padding:14px 32px;
                      border-radius:8px;text-decoration:none;font-size:16px;
                      font-weight:600;display:inline-block;">
              Accept Invitation
            </a>
          </div>

          <!-- Link fallback -->
          <p style="color:#64748b;font-size:13px;text-align:center;margin:24px 0 0;">
            Or copy this link into your browser:
          </p>
          <p style="color:#7c3aed;font-size:12px;text-align:center;
                    word-break:break-all;margin:8px 0 0;">
            ${inviteUrl}
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:24px 32px;border-top:1px solid #1e2a45;
                    text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">
            This invitation expires in 7 days. 
            If you did not expect this email, you can safely ignore it.
          </p>
          <p style="color:#475569;font-size:12px;margin:8px 0 0;">
            © 2025 DevPilot AI. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

export function welcomeEmailTemplate({
  userName,
  orgName,
}: {
  userName: string
  orgName: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f172a;
                  border-radius:12px;border:1px solid #1e2a45;overflow:hidden;">
        
        <div style="background:#7c3aed;padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">
            Welcome to DevPilot AI
          </h1>
        </div>

        <div style="padding:40px 32px;">
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">
            Hey ${userName}, welcome aboard! 🎉
          </h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 16px;">
            You have successfully joined 
            <strong style="color:#a78bfa;">${orgName}</strong> 
            on DevPilot AI.
          </p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
            You can now access AI code reviews, bug detection, 
            documentation generation, and team analytics.
          </p>
          <div style="text-align:center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard"
               style="background:#7c3aed;color:#ffffff;padding:14px 32px;
                      border-radius:8px;text-decoration:none;font-size:16px;
                      font-weight:600;display:inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>

        <div style="padding:24px 32px;border-top:1px solid #1e2a45;
                    text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">
            © 2025 DevPilot AI. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

export function magicLinkTemplate({
  url,
  email,
}: {
  url: string
  email: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f172a;
                  border-radius:12px;border:1px solid #1e2a45;overflow:hidden;">
        
        <div style="background:#7c3aed;padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">
            DevPilot AI
          </h1>
        </div>

        <div style="padding:40px 32px;">
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">
            Your Magic Sign-in Link
          </h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 8px;">
            We received a sign-in request for:
          </p>
          <p style="color:#a78bfa;font-size:15px;margin:0 0 32px;font-weight:600;">
            ${email}
          </p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
            Click the button below to sign in. 
            This link expires in <strong style="color:#ffffff;">10 minutes</strong>.
          </p>
          <div style="text-align:center;">
            <a href="${url}"
               style="background:#7c3aed;color:#ffffff;padding:14px 32px;
                      border-radius:8px;text-decoration:none;font-size:16px;
                      font-weight:600;display:inline-block;">
              Sign In to DevPilot AI
            </a>
          </div>
          <p style="color:#64748b;font-size:13px;text-align:center;margin:24px 0 0;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>

        <div style="padding:24px 32px;border-top:1px solid #1e2a45;
                    text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">
            © 2025 DevPilot AI. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}
