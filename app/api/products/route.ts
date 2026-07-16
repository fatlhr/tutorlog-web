import { NextResponse } from "next/server";

import { billingErrorResponse } from "@/lib/billing/server/auth";
import { getCatalog } from "@/lib/billing/server/catalog";

export async function GET() {
  try {
    return NextResponse.json(await getCatalog());
  } catch (error) {
    return billingErrorResponse(error);
  }
}
