type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmailAlert(input: SendEmailInput): Promise<void> {
  if (!input.to || !input.subject || !input.text) {
    throw new Error("Missing email fields");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "Cloud Ops <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${body}`);
  }
}
