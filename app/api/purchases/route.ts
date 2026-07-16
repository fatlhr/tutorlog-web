import { NextResponse } from "next/server";

import { isPackageCode } from "@/lib/billing/contracts";
import {
  billingErrorResponse,
  invalidRequestResponse,
  requireUser,
} from "@/lib/billing/server/auth";
import { isPaymentMethod } from "@/lib/billing/server/catalog";
import { createOrResumePurchase } from "@/lib/billing/server/purchases";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const packageCode = (body as { packageCode?: unknown } | null)?.packageCode;
    const method = (body as { method?: unknown } | null)?.method;
    if (!isPackageCode(packageCode) || !isPaymentMethod(method)) {
      return invalidRequestResponse();
    }

    const { user } = await requireUser();
    const purchase = await createOrResumePurchase(user, packageCode, method);
    return NextResponse.json(purchase);
  } catch (error) {
    if (error instanceof SyntaxError) return invalidRequestResponse();
    return billingErrorResponse(error);
  }
}
