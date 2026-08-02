import { NextResponse } from "next/server";

import {
  authorizeExport,
  type ExportFeature,
} from "@/lib/billing/server/exports";
import { createClient } from "@/lib/supabase/server";

const EXPORT_FEATURES: readonly ExportFeature[] = [
  "recap_pdf",
  "recap_csv",
  "invoice_pdf",
];

function isExportFeature(value: unknown): value is ExportFeature {
  return typeof value === "string" && EXPORT_FEATURES.includes(value as ExportFeature);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const feature = (body as { feature?: unknown } | null)?.feature;
  if (!isExportFeature(feature)) {
    return NextResponse.json({ error: "Unsupported export feature" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const result = await authorizeExport(feature);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Export authorization failed" }, { status: 500 });
  }
}
