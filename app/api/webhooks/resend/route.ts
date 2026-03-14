import { NextResponse } from "next/server";

// Minimal webhook ingestion for Resend event tracking.
// Set RESEND_WEBHOOK_SECRET and configure Authorization: Bearer <secret> in Resend webhook.
export async function POST(request: Request) {
  const expected = process.env.RESEND_WEBHOOK_SECRET;
  if (expected) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }
  }

  const payload = await request.json();
  const eventType = String(payload?.type ?? "unknown");
  const messageId = String(payload?.data?.email_id ?? payload?.data?.id ?? "unknown");
  const to = payload?.data?.to ?? payload?.data?.email_to ?? [];

  // Replace this with Firestore persistence if needed.
  console.info("[resend-webhook]", {
    receivedAt: new Date().toISOString(),
    eventType,
    messageId,
    to
  });

  return NextResponse.json({ received: true, eventType, messageId });
}
