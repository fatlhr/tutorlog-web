import { NextResponse } from "next/server";

import {
  billingErrorResponse,
  invalidRequestResponse,
  requireUser,
} from "@/lib/billing/server/auth";
import { getPurchaseStatus, isUuid } from "@/lib/billing/server/payments";

export async function GET(
  _request: Request,
  context: { params: Promise<{ purchaseId: string }> },
) {
  try {
    const { purchaseId } = await context.params;
    if (!isUuid(purchaseId)) return invalidRequestResponse();

    const { user } = await requireUser();
    return NextResponse.json(await getPurchaseStatus(user.id, purchaseId));
  } catch (error) {
    return billingErrorResponse(error);
  }
}
