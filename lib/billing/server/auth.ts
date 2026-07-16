import "server-only";

import { NextResponse } from "next/server";

import { BillingError, type BillingErrorCode } from "@/lib/billing/errors";
import { createClient } from "@/lib/supabase/server";

const SAFE_MESSAGES: Record<BillingErrorCode, string> = {
  AUTH_REQUIRED: "Login diperlukan",
  PAYMENT_PROVIDER_NOT_READY: "Penyedia pembayaran belum siap",
  PACKAGE_NOT_FOUND: "Paket tidak ditemukan",
  PACKAGE_UNAVAILABLE: "Paket tidak tersedia",
  PRICE_CHANGED: "Harga paket telah berubah",
  LIFETIME_ALREADY_ACTIVE: "Akses lifetime sudah aktif",
  PURCHASE_NOT_FOUND: "Pembelian tidak ditemukan",
  PAYMENT_NOT_FOUND: "Pembayaran tidak ditemukan",
  PAYMENT_NOT_CANCELABLE: "Pembayaran tidak dapat dibatalkan",
  INVALID_PAYMENT_TRANSITION: "Status pembayaran tidak valid",
  PROVIDER_UNAVAILABLE: "Penyedia pembayaran tidak tersedia",
  PROVIDER_RESPONSE_INVALID: "Respons penyedia pembayaran tidak valid",
  EXPORT_NOT_ALLOWED: "Aksi tidak diizinkan",
};

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new BillingError("AUTH_REQUIRED", "Login diperlukan");
  return { supabase, user };
}

export function invalidRequestResponse() {
  return NextResponse.json(
    { error: { code: "INVALID_REQUEST", message: "Permintaan tidak valid" } },
    { status: 400 },
  );
}

export function billingErrorResponse(error: unknown) {
  if (!(error instanceof BillingError)) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 },
    );
  }

  const body = { error: { code: error.code, message: SAFE_MESSAGES[error.code] } };

  switch (error.code) {
    case "AUTH_REQUIRED":
      return NextResponse.json(body, { status: 401 });
    case "PACKAGE_NOT_FOUND":
    case "PURCHASE_NOT_FOUND":
    case "PAYMENT_NOT_FOUND":
      return NextResponse.json(body, { status: 404 });
    case "PACKAGE_UNAVAILABLE":
    case "PRICE_CHANGED":
    case "LIFETIME_ALREADY_ACTIVE":
    case "PAYMENT_NOT_CANCELABLE":
    case "INVALID_PAYMENT_TRANSITION":
    case "EXPORT_NOT_ALLOWED":
      return NextResponse.json(body, { status: 409 });
    case "PROVIDER_RESPONSE_INVALID":
      return NextResponse.json(body, { status: 502 });
    case "PAYMENT_PROVIDER_NOT_READY":
    case "PROVIDER_UNAVAILABLE":
      return NextResponse.json(body, { status: 503 });
  }

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
    { status: 500 },
  );
}
