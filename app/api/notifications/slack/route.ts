import { NextResponse } from "next/server";
import { sendSlackAlert } from "@/lib/alerts/slack";

export async function POST(request: Request) {
  const body = await request.json();
  await sendSlackAlert(process.env.SLACK_WEBHOOK_URL ?? "", body.text ?? "Cloud alert");
  return NextResponse.json({ sent: true, channel: "slack" });
}
