import { NextResponse } from "next/server";
import { sendEmailAlert } from "@/lib/alerts/email";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    await sendEmailAlert({
      to: body.to,
      subject: body.subject ?? "Cloud Alert",
      text: body.message ?? "Alert triggered"
    });
    return NextResponse.json({ sent: true, channel: "email" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
