export async function sendEmailAlert(to: string, subject: string, message: string): Promise<void> {
  // Placeholder adapter. Wire this to SendGrid/SES/Resend in production.
  if (!to || !subject || !message) {
    throw new Error("Missing email fields");
  }
}
