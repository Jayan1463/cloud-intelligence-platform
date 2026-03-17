import { sendEmailAlert } from "@/lib/alerts/email";
import { sendSlackAlert } from "@/lib/alerts/slack";

export async function dispatchNotification(input: {
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  slackText?: string;
  webhookUrl?: string;
  webhookPayload?: Record<string, unknown>;
}): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (input.emailTo && input.emailSubject && input.emailBody) {
    tasks.push(sendEmailAlert({ to: input.emailTo, subject: input.emailSubject, text: input.emailBody }));
  }

  if (input.slackText) {
    tasks.push(sendSlackAlert(process.env.SLACK_WEBHOOK_URL ?? "", input.slackText));
  }

  if (input.webhookUrl) {
    tasks.push(fetch(input.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input.webhookPayload ?? { text: input.slackText ?? "Notification" })
    }));
  }

  await Promise.allSettled(tasks);
}
