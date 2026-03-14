import { randomBytes, createHash } from "crypto";
import { sendEmailAlert } from "@/lib/alerts/email";
import type { AppRole } from "@/types/auth";

export function createInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export async function sendOrganizationInviteEmail(input: {
  email: string;
  orgId: string;
  role: AppRole;
  invitedBy: string;
  inviteToken: string;
}): Promise<{ messageId: string; acceptedAt: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL ?? "http://localhost:3000";
  const baseUrl = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  const inviteUrl = `${baseUrl}/auth/signup?orgId=${encodeURIComponent(input.orgId)}&invite=${encodeURIComponent(input.inviteToken)}`;

  const traceId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const subject = `[Cloud Intelligence Invite ${traceId}] You're invited to join organization ${input.orgId}`;
  const text = [
    `[Cloud Intelligence Invite ${traceId}]`,
    `You have been invited as ${input.role}.`,
    `Invited by: ${input.invitedBy}`,
    `Accept invite: ${inviteUrl}`,
    "If you did not expect this invite, you can ignore this email."
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Cloud Intelligence Invitation</h2>
      <p>You were invited to join <strong>${input.orgId}</strong> as <strong>${input.role}</strong>.</p>
      <p>Invited by: <strong>${input.invitedBy}</strong></p>
      <p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 10px 14px; background: #06b6d4; color: #111; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Accept Invitation
        </a>
      </p>
      <p style="font-size: 12px; color: #555;">If you did not expect this invite, you can safely ignore this email.</p>
    </div>
  `;

  const result = await sendEmailAlert({
    to: input.email,
    subject,
    text,
    html
  });

  return {
    messageId: result.messageId,
    acceptedAt: result.acceptedAt
  };
}
