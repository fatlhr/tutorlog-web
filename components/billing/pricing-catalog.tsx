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
        const isUnavailable = !isFree && !product.available;
        const checkoutPath = `/checkout?package=${encodeURIComponent(product.code)}`;
        const href = isFree
          ? authenticated ? "/app" : "/login"
          : authenticated
            ? checkoutPath
            : `/login?next=${encodeURIComponent(checkoutPath)}`;

        return (
          <article
            className={`${styles.row} ${product.featured ? styles.featured : ""}`}
            data-package={product.code}
            key={product.code}
          >
            <div className={styles.name}>
              {product.featured ? <span className={styles.badge}>Paling hemat</span> : null}
              <h2>{product.name}</h2>
              <p>{product.description}</p>
            </div>

            <div className={styles.amount}>
              <strong>{formatIdr(product.amount)}</strong>
              <span>{productPeriodLabel(product)}</span>
            </div>

            <div className={styles.note}>
              {product.code === "plus_12m" && savings > 0 ? (
                <p>Hemat {formatIdr(savings)} dibanding membeli paket 30 hari selama 12 bulan.</p>
              ) : (
                <p>{isFree ? "Mulai tanpa biaya." : "Seluruh fitur Plus termasuk dalam paket ini."}</p>
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
                  {isFree ? (authenticated ? "Buka TutorLog" : "Mulai gratis") : "Pilih paket"}
                </MarketingButton>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
