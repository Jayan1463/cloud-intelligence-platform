type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendEmailResult = {
  provider: "resend" | "dev-log";
  messageId: string;
  acceptedAt: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmailAlert(input: SendEmailInput): Promise<SendEmailResult> {
  if (!input.to || !input.subject || !input.text) {
    throw new Error("Missing email fields");
  }

  const deliveryMode = process.env.EMAIL_DELIVERY_MODE ?? "auto";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL ?? "Cloud Ops <onboarding@resend.dev>";
  const shouldUseDevLog = deliveryMode === "log" || (deliveryMode === "auto" && !apiKey);

  if (shouldUseDevLog) {
    const mockId = `dev_${Date.now()}`;
    console.info("[email-dev-log] Simulated email delivery", {
      messageId: mockId,
      to: input.to,
      from,
      subject: input.subject
    });

    return {
      provider: "dev-log",
      messageId: mockId,
      acceptedAt: new Date().toISOString()
    };
  }

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Set EMAIL_DELIVERY_MODE="log" for local development.');
  }

  let lastError = "Unknown email send failure";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
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

    if (response.ok) {
      const payload = (await response.json()) as { id?: string };
      if (!payload.id) {
        throw new Error("Resend accepted email but did not return message id");
      }

      return {
        provider: "resend",
        messageId: payload.id,
        acceptedAt: new Date().toISOString()
      };
    }

    lastError = `Failed to send email: ${response.status} ${await response.text()}`;
    if (attempt < 3) {
      await sleep(attempt * 300);
    }
  }

  throw new Error(lastError);
}
