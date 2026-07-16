import { NextResponse } from "next/server";

import { BillingError } from "@/lib/billing/errors";
import { processIpaymuCallback } from "@/lib/billing/server/payments";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    await processIpaymuCallback(rawBody, request.headers);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    if (error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID") {
      return NextResponse.json(
        { error: { code: "INVALID_CALLBACK", message: "Callback tidak valid" } },
        { status: 400 },
      );
    }

    if (
      error instanceof BillingError
      && (error.code === "PAYMENT_PROVIDER_NOT_READY" || error.code === "PROVIDER_UNAVAILABLE")
    ) {
      return NextResponse.json(
        { error: { code: "CALLBACK_UNAVAILABLE", message: "Callback tidak dapat diproses" } },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: { code: "CALLBACK_UNAVAILABLE", message: "Callback tidak dapat diproses" } },
      { status: 503 },
    );
  }
}
