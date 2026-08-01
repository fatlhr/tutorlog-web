"use client";

import { useEffect } from "react";
import type { ProductSummary } from "@/lib/billing/contracts";
import { trackBillingEvent } from "@/lib/billing/analytics-client";
import {
  annualSavings,
  formatIdr,
  productPeriodLabel,
} from "@/lib/billing/ui-model";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import styles from "./pricing.module.css";

type PricingCatalogProps = {
  products: ProductSummary[];
  authenticated: boolean;
};

export function PricingCatalog({ products, authenticated }: PricingCatalogProps) {
  const savings = annualSavings(products);

  useEffect(() => {
    trackBillingEvent("pricing_viewed", { surface: "pricing" });
  }, []);

  return (
    <section className={styles.catalog} aria-label="Pilihan paket TutorLog">
      {products.map((product) => {
        const isFree = product.code === "free";
        const isSavings = product.code === "plus_12m";
        const isLifetime = product.code === "plus_lifetime";
        const badgeLabel = isSavings
          ? "Paling hemat"
          : isLifetime
            ? "Sekali bayar"
            : null;
        const isUnavailable = !isFree && !product.available;
        const checkoutPath = `/checkout?package=${encodeURIComponent(product.code)}`;
        const href = isFree
          ? authenticated ? "/app" : "/login"
          : authenticated
            ? checkoutPath
            : `/login?next=${encodeURIComponent(checkoutPath)}`;

        return (
          <article
            className={`${styles.row} ${isSavings ? styles.savings : ""} ${isLifetime ? styles.lifetime : ""}`}
            data-package={product.code}
            key={product.code}
          >
            <div className={styles.name}>
              {badgeLabel ? (
                <span className={`${styles.badge} ${isLifetime ? styles.lifetimeBadge : ""}`}>
                  {badgeLabel}
                </span>
              ) : null}
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>

            <div className={styles.amount}>
              <strong>{formatIdr(product.amount)}</strong>
              <span>{productPeriodLabel(product)}</span>
            </div>

            <div className={styles.note}>
              {isSavings && savings > 0 ? (
                <p>Hemat {formatIdr(savings)} dibanding membeli paket 30 hari selama 12 bulan.</p>
              ) : isLifetime ? (
                <p>Bayar sekali untuk akses Plus selamanya.</p>
              ) : (
                <p>{isFree ? "Mulai tanpa biaya." : "Ekspor rekap tanpa batas dan unduh PDF invoice."}</p>
              )}
            </div>

            <div className={styles.action}>
              {isUnavailable ? (
                <MarketingButton disabled size="compact">
                  Belum tersedia
                </MarketingButton>
              ) : (
                <MarketingButton
                  href={href}
                  size="compact"
                  onClick={() => trackBillingEvent("package_selected", {
                    packageCode: product.code,
                    surface: "pricing",
                  })}
                >
                  {isFree
                    ? (authenticated ? "Buka Beranda" : "Mulai gratis")
                    : `Pilih ${product.name}`}
                </MarketingButton>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
