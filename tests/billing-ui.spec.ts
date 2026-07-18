import { expect, test, type Page } from "@playwright/test";
import type { PaymentStatusView, PurchaseSummary } from "../lib/billing/contracts";
import { billingFixtures } from "../lib/billing/fixtures";
import { accessLabel, paymentStatusCopy } from "../lib/billing/ui-model";

async function openBrowserOrigin(page: Page) {
  await page.goto("/login");
}

function purchaseFor(payment: PaymentStatusView): PurchaseSummary {
  return {
    id: payment.purchaseId,
    packageCode: "plus_12m",
    packageName: payment.packageName,
    state: payment.state === "paid" ? "completed" : "open",
    payment,
  };
}

async function mockJson(page: Page, url: string, body: unknown) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("Billing UI fixture contracts", () => {
  test("preserves the protected checkout path through login", async ({ page }) => {
    await page.goto("/checkout?package=plus_12m");

    await expect(page).toHaveURL(/\/login\?next=%2Fcheckout%3Fpackage%3Dplus_12m$/);
  });

  test("covers public packages with the shared product DTO inventory", async () => {
    expect(billingFixtures.products.map((product) => product.code)).toEqual([
      "free",
      "plus_30d",
      "plus_12m",
      "plus_lifetime",
    ]);
    expect(billingFixtures.products.find((product) => product.featured)?.code).toBe("plus_12m");
    expect(billingFixtures.products.every((product) => product.currency === "IDR")).toBe(true);
  });

  test("uses fixture-backed QRIS and VA quotes without provider responses", async ({ page }) => {
    await page.route("**/api/quotes", async (route) => {
      const request = route.request();
      const body = request.postDataJSON() as { method?: string };
      const quote = body.method === "va"
        ? billingFixtures.quotes.va
        : billingFixtures.quotes.qris;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(quote),
      });
    });
    await openBrowserOrigin(page);

    const quotes = await page.evaluate(async () => {
      const request = (method: "qris" | "va") => fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageCode: "plus_12m", method }),
      }).then((response) => response.json());
      return Promise.all([request("qris"), request("va")]);
    });

    expect(quotes[0]).toMatchObject({ method: "qris", channelFee: 1000, totalAmount: 20000 });
    expect(quotes[1]).toMatchObject({ method: "va", channelFee: 4000, totalAmount: 153000 });
  });

  test("covers pending resume and replacement with shared purchase DTOs", async ({ page }) => {
    const pending = purchaseFor(billingFixtures.payments.pending);
    const replaced = purchaseFor({
      ...billingFixtures.payments.pending,
      state: "superseded",
      redirectUrl: null,
    });
    await mockJson(page, "**/api/purchases", pending);
    await mockJson(page, "**/api/payments/*/cancel", replaced);
    await openBrowserOrigin(page);

    const result = await page.evaluate(async () => {
      const resume = await fetch("/api/purchases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageCode: "plus_12m", method: "qris" }),
      }).then((response) => response.json());
      const replacement = await fetch("/api/payments/PAY-TEST-001/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }).then((response) => response.json());
      return { resume, replacement };
    });

    expect(result.resume.payment.redirectUrl).toMatch(/^https:\/\//);
    expect(result.replacement.payment.state).toBe("superseded");
    expect(result.replacement.payment.redirectUrl).toBeNull();
  });

  test("covers verifying, paid, expired retry, and duplicate-review state copies", async ({ page }) => {
    const scenarios = [
      billingFixtures.payments.verifying,
      billingFixtures.payments.paid,
      billingFixtures.payments.expired,
      billingFixtures.payments.duplicateReview,
    ];
    let responseIndex = 0;
    await page.route("**/api/purchases/*", async (route) => {
      const payment = scenarios[Math.min(responseIndex, scenarios.length - 1)];
      responseIndex += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(purchaseFor(payment)),
      });
    });
    await openBrowserOrigin(page);

    const purchases = await page.evaluate(async () => Promise.all(
      ["verifying", "paid", "expired", "duplicate"].map((id) =>
        fetch(`/api/purchases/${id}`).then((response) => response.json()),
      ),
    ));

    expect(purchases.map((purchase) => purchase.payment.safeReference)).toEqual([
      "PAY-TEST-002",
      "PAY-TEST-003",
      "PAY-TEST-004",
      "PAY-TEST-007",
    ]);
    expect(paymentStatusCopy(billingFixtures.payments.verifying).title).toBe("Memverifikasi pembayaran");
    expect(paymentStatusCopy(billingFixtures.payments.paid).title).toBe("Plus sudah aktif");
    expect(paymentStatusCopy(billingFixtures.payments.expired).title).toBe("Pembayaran kedaluwarsa");
    expect(billingFixtures.payments.duplicateReview.duplicateReview).toBe(true);
  });

  test("covers all four Profile access fixture states", async () => {
    expect(accessLabel(billingFixtures.access.free)).toBe("Free");
    expect(accessLabel(billingFixtures.access.active)).toBe("Plus Aktif");
    expect(accessLabel(billingFixtures.access.expired)).toBe("Plus Berakhir");
    expect(accessLabel(billingFixtures.access.lifetime)).toBe("Plus Selamanya");
  });

  test("uses a blocked export DTO for the action-triggered paywall decision", async ({ page }) => {
    await mockJson(page, "**/api/exports/authorize", billingFixtures.exports.blocked);
    await openBrowserOrigin(page);

    const decision = await page.evaluate(() => fetch("/api/exports/authorize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feature: "recap_pdf" }),
    }).then((response) => response.json()));

    expect(decision).toEqual(billingFixtures.exports.blocked);
  });

  test("renders authenticated checkout, payment, Profile, and paywall interactions", async () => {
    test.skip(
      true,
      "Unavailable without a fixture auth/catalog server or test credentials; U10 forbids adding test-only production routes or secrets.",
    );
  });
});
