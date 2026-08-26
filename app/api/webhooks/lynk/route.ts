import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  describeRedactedLynkPayload,
  getLynkWebhookMode,
  LynkWebhookInputError,
  type LynkWebhookEnv,
  parseLynkWebhookJson,
  readLynkWebhookBody,
  resolveLynkWebhookEnv,
} from "@/lib/billing/providers/lynk-webhook";

function getCloudflareLynkEnv(): LynkWebhookEnv | undefined {
  try {
    return getCloudflareContext().env as LynkWebhookEnv;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const runtimeEnv = resolveLynkWebhookEnv(getCloudflareLynkEnv(), {
    LYNK_WEBHOOK_ENABLED: process.env.LYNK_WEBHOOK_ENABLED,
    LYNK_WEBHOOK_CAPTURE_ONLY: process.env.LYNK_WEBHOOK_CAPTURE_ONLY,
  });
  const mode = getLynkWebhookMode(runtimeEnv);
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
