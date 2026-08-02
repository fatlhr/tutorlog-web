import { NextResponse } from "next/server";

import {
  billingErrorResponse,
  invalidRequestResponse,
  requireUser,
} from "@/lib/billing/server/auth";
import { cancelPendingPayment, isUuid } from "@/lib/billing/server/payments";

export async function POST(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> },
) {
  try {
    const { paymentId } = await context.params;
    if (!isUuid(paymentId)) return invalidRequestResponse();

    const { user } = await requireUser();
    return NextResponse.json(await cancelPendingPayment(user.id, paymentId));
  } catch (error) {
    return billingErrorResponse(error);
  }
}
