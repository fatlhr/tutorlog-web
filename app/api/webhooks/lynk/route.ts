import { NextResponse } from "next/server";

import {
  describeRedactedLynkPayload,
  getLynkWebhookMode,
  LynkWebhookInputError,
  parseLynkWebhookJson,
  readLynkWebhookBody,
} from "@/lib/billing/providers/lynk-webhook";

export async function POST(request: Request) {
  const mode = getLynkWebhookMode(process.env);
  if (mode === "disabled") {
    return NextResponse.json(
      { error: { code: "WEBHOOK_DISABLED", message: "Webhook belum aktif" } },
      { status: 503 },
    );
  }

  if (mode === "process") {
    return NextResponse.json(
      { error: { code: "WEBHOOK_NOT_READY", message: "Webhook belum siap diproses" } },
      { status: 503 },
    );
  }

  try {
    const rawBody = await readLynkWebhookBody(request);
    const payload = parseLynkWebhookJson(rawBody);
    const summary = describeRedactedLynkPayload(payload);

    console.info("lynk_webhook_capture", summary);
    return NextResponse.json({ status: "captured" }, { status: 200 });
  } catch (error) {
    if (error instanceof LynkWebhookInputError) {
      return NextResponse.json(
        { error: { code: "INVALID_WEBHOOK", message: "Webhook tidak valid" } },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: { code: "WEBHOOK_UNAVAILABLE", message: "Webhook tidak dapat diproses" } },
      { status: 503 },
    );
  }
}
