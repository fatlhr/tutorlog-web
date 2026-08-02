import type {
  AccessSummary,
  PaymentStatusView,
  ProductSummary,
} from "./contracts";

export type PaymentStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface PaymentStatusCopy {
  title: string;
  body: string;
  tone: PaymentStatusTone;
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount).replace(/^Rp\s*/u, "Rp");
}

export function productPeriodLabel(product: ProductSummary): string {
  switch (product.durationKind) {
    case "free":
      return "gratis";
    case "days":
      return `${product.durationValue ?? 0} hari`;
    case "months":
      return `${product.durationValue ?? 0} bulan`;
    case "lifetime":
      return "selamanya";
  }
}

export function annualSavings(products: readonly ProductSummary[]): number {
  const monthly = products.find(
    (product) => product.code === "plus_30d" && product.available,
  );
  const annual = products.find(
    (product) => product.code === "plus_12m" && product.available,
  );

  if (!monthly || !annual) return 0;
  return Math.max(0, (12 * monthly.amount) - annual.amount);
}

export function accessLabel(access: AccessSummary): string {
  if (access.isLifetime) return "Plus selamanya";
  if (access.state === "plus_active") return "Plus aktif";
  if (access.state === "plus_expired") return "Plus berakhir";
  return "Paket Free";
}

export function paymentStatusCopy(payment: PaymentStatusView): PaymentStatusCopy {
  if (payment.duplicateReview) {
    return {
      title: "Pembayaran sedang ditinjau",
      body: "Pembayaran ganda sedang diperiksa. Akses Plus yang sudah aktif tetap aktif selama peninjauan.",
      tone: "warning",
    };
  }

  if (payment.state === "pending" && payment.verificationDeadline) {
    return {
      title: "Memverifikasi pembayaran",
      body: "Pembayaran sudah diterima dan sedang diverifikasi.",
      tone: "info",
    };
  }

  const copy: Record<PaymentStatusView["state"], PaymentStatusCopy> = {
    created: {
      title: "Menyiapkan pembayaran",
      body: "Detail pembayaran sedang disiapkan.",
      tone: "neutral",
    },
    pending: {
      title: "Menunggu pembayaran",
      body: "Selesaikan pembayaran sebelum batas waktu yang tertera.",
      tone: "info",
    },
    superseded: {
      title: "Gunakan pembayaran terbaru",
      body: "Pembayaran ini sudah digantikan oleh pembayaran yang lebih baru.",
      tone: "warning",
    },
    paid: {
      title: "Plus sudah aktif",
      body: "Pembayaran berhasil. Plus sudah aktif.",
      tone: "success",
    },
    expired: {
      title: "Pembayaran kedaluwarsa",
      body: "Batas waktu pembayaran telah berakhir.",
      tone: "warning",
    },
    failed: {
      title: "Pembayaran gagal",
      body: "Pembayaran belum berhasil. Coba buat pembayaran baru.",
      tone: "danger",
    },
    canceled: {
      title: "Pembayaran dibatalkan",
      body: "Pembayaran ini sudah dibatalkan.",
      tone: "neutral",
    },
    refunded: {
      title: "Pembayaran dikembalikan",
      body: "Dana pembayaran ini sudah dikembalikan.",
      tone: "neutral",
    },
  };

  return copy[payment.state];
}
