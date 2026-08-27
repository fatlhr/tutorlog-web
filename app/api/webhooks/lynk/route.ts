import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  extractLynkSignedFields,
  LynkSignatureInputError,
  verifyLynkSignature,
} from "@/lib/billing/providers/lynk-signature";
import {
  describeLynkWebhookConfig,
  describeRedactedLynkPayload,
  getLynkWebhookMode,
  LynkWebhookInputError,
  type LynkWebhookEnv,
  parseLynkPaymentReceived,
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
  const cloudflareEnv = getCloudflareLynkEnv();
  const runtimeEnv = resolveLynkWebhookEnv(cloudflareEnv, {
    LYNK_MERCHANT_KEY: process.env.LYNK_MERCHANT_KEY,
    LYNK_WEBHOOK_ENABLED: process.env.LYNK_WEBHOOK_ENABLED,
    LYNK_WEBHOOK_CAPTURE_ONLY: process.env.LYNK_WEBHOOK_CAPTURE_ONLY,
  });
  const mode = getLynkWebhookMode(runtimeEnv);
  if (mode === "disabled") {
    console.info(
      "lynk_webhook_config",
      describeLynkWebhookConfig(cloudflareEnv !== undefined, runtimeEnv),
    );
    return NextResponse.json(
      { error: { code: "WEBHOOK_DISABLED", message: "Webhook belum aktif" } },
      { status: 503 },
    );
  }

  if (!runtimeEnv.LYNK_MERCHANT_KEY) {
    console.info(
      "lynk_webhook_config",
      describeLynkWebhookConfig(cloudflareEnv !== undefined, runtimeEnv),
    );
    return NextResponse.json(
      { error: { code: "WEBHOOK_UNAVAILABLE", message: "Webhook tidak dapat diproses" } },
      { status: 503 },
    );
  }

  try {
    const rawBody = await readLynkWebhookBody(request);
    const payload = parseLynkWebhookJson(rawBody);

    const receivedSignature = request.headers.get("x-lynk-signature");
    if (!receivedSignature) {
      return NextResponse.json(
        { error: { code: "INVALID_SIGNATURE", message: "Signature tidak valid" } },
        { status: 401 },
      );
    }

    const signedFields = extractLynkSignedFields(payload);
    if (!verifyLynkSignature(
      signedFields,
      receivedSignature,
      runtimeEnv.LYNK_MERCHANT_KEY,
    )) {
      return NextResponse.json(
        { error: { code: "INVALID_SIGNATURE", message: "Signature tidak valid" } },
        { status: 401 },
      );
    }

    if (mode === "capture") {
      const summary = describeRedactedLynkPayload(payload);
      console.info("lynk_webhook_capture", summary);
      return NextResponse.json({ status: "captured" }, { status: 200 });
    }

    const payment = parseLynkPaymentReceived(payload);
    try {
      const { processLynkPaymentReceived } = await import(
        "@/lib/billing/server/lynk-webhook"
      );
      const result = await processLynkPaymentReceived(payment, payload);

      console.info("lynk_webhook_result", {
        status: result.status,
        reviewReason: result.reviewReason,
      });
      return NextResponse.json(
        { status: result.status === "needs_review" ? "review" : "ok" },
        { status: 200 },
      );
    } catch {
      return NextResponse.json(
        { error: { code: "WEBHOOK_UNAVAILABLE", message: "Webhook tidak dapat diproses" } },
        { status: 503 },
      );
    }
  } catch (error) {
    if (
      error instanceof LynkWebhookInputError
      || error instanceof LynkSignatureInputError
    ) {
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
