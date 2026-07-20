# Duitku Payment Gateway Migration Design

**Status:** Draft

**Date:** 2026-07-20

**Architecture direction:** Replace iPaymu with Duitku as the payment provider. The existing `PaymentProvider` interface remains the integration seam; only the provider adapter, webhook route, and supporting config change.

## 1. Purpose

This document specifies the migration from iPaymu to Duitku Payment Gateway for TutorLog Plus. Duitku is preferred because:

- PT Kharisma Catur Mandala holds a Bank Indonesia Transfer Dana & Payment Gateway license (No. 23/660/DKSP/Srt/B).
- Registered as PSE with Kominfo (No. 000972.01/DJAI.PSE/06/2021).
- Holds ISO 9001:2015 certification (TUV SUD).
- More established track record (Toyota, Niagahoster, Media Indonesia, Vocagame).
- QRIS fee at 0.7% (lower than many competitors).
- Well-documented API with sandbox environment.

The `PaymentProvider` interface is already provider-neutral. The migration replaces the adapter implementation without changing the purchase, entitlement, or UI domains.

## 2. iPaymu vs Duitku comparison

### 2.1 API endpoints

| Action | iPaymu | Duitku |
|--------|--------|--------|
| Create transaction | `POST /api/v2/payment` | `POST /webapi/api/merchant/v2/inquiry` |
| Check status | `POST /api/payment` (inquiry) | `POST /webapi/api/merchant/transactionStatus` |
| Get payment methods | N/A | `POST /webapi/api/merchant/paymentmethod/getpaymentmethod` |
| Cancel | `POST /api/payment/delete` | No direct cancel API (state expires naturally) |

**Base URLs:**
- iPaymu: `https://sandbox.ipaymu.com` / `https://api.ipaymu.com`
- Duitku: `https://sandbox.duitku.com` / `https://passport.duitku.com`

### 2.2 Authentication and signing

| Aspect | iPaymu | Duitku |
|--------|--------|--------|
| Auth method | API Key in header | HMAC-SHA256 signature in body |
| Create signature | `HMAC_SHA256(METHOD:VA:bodyHash:API_KEY)` | `HMAC_SHA256(merchantCode + merchantOrderId + paymentAmount, apiKey)` |
| Status signature | Same as create | `HMAC_SHA256(merchantCode + merchantOrderId, apiKey)` |
| Callback verification | Header-based (`X-Signature`, `X-External-ID`, `X-Timestamp`) | Body field `signature` with same HMAC formula |
| Signature output | Hex lowercase | Hex lowercase |

### 2.3 Callback format

| Aspect | iPaymu | Duitku |
|--------|--------|--------|
| Content-Type | `application/json` | `x-www-form-urlencoded` |
| Signature location | Header `X-Signature` | Body field `signature` |
| Timestamp | Header `X-Timestamp` | Not provided (use server receive time) |
| Status codes | `berhasil`/`1` = paid, `pending`/`0` = pending, `-2` = expired | `00` = success, `01` = failed |
| Extra fields | `externalID`, `expiredDate` | `publisherOrderId`, `settlementDate`, `issuerCode`, `customerName` |

### 2.4 Payment methods

| Method | iPaymu | Duitku |
|--------|--------|--------|
| QRIS | Limited | Full support (ShopeePay, Nobu, Gudang Voucher, Nusapay) |
| VA | Limited banks | BCA, Mandiri, BNI, CIMB, Permata, Maybank, BRI, BSI, BSS, BNC, Artha Graha, ATM Bersama, Danamon |
| E-wallet | N/A | OVO, ShopeePay, LinkAja, DANA |
| Credit card | N/A | Visa, Mastercard, JCB |
| Retail | N/A | Indomaret, Alfamart, Pegadaian, POS Indonesia |
| Paylater | N/A | Indodana, Atome |

### 2.5 Response format (create transaction)

**iPaymu:**
```json
{
  "Status": 101,
  "Message": "Success",
  "Data": {
    "SessionId": "...",
    "PaymentNo": "...",
    "PaymentUrl": "...",
    "ExpiredDate": "..."
  }
}
```

**Duitku:**
```json
{
  "merchantCode": "DXXXX",
  "reference": "DXXXXCX80TZJ85Q70QCI",
  "paymentUrl": "https://sandbox.duitku.com/topup/topupdirectv2.aspx?ref=...",
  "vaNumber": "7007014001444348",
  "qrString": "0002010102...",
  "amount": "40000",
  "statusCode": "00",
  "statusMessage": "SUCCESS"
}
```

### 2.6 Sandbox credentials

Duitku provides sandbox at `sandbox.duitku.com`. Registration at `passport.duitku.com/Account/Register`. Test credentials for various payment methods are documented in the API reference (sandbox VA demo page, test card numbers, etc.).

## 3. Payment flow (Duitku)

```
User selects package on /harga
  -> /checkout?package=<code> (authenticated)
  -> POST /api/quotes { packageCode, method } -> CheckoutQuote
  -> POST /api/purchases { packageCode, method }
     -> reserve_billing_purchase RPC
     -> duitkuProvider.createPayment() -> ProviderPaymentResult
        -> POST /webapi/api/merchant/v2/inquiry
        -> Returns: reference, paymentUrl, vaNumber, qrString, statusCode
     -> finalize_billing_provider_payment RPC
  -> Redirect to Duitku paymentUrl (or display vaNumber/qrString directly)
  -> POST /api/webhooks/duitku (x-www-form-urlencoded callback)
     -> verifyCallback() (HMAC-SHA256 body signature)
     -> process_billing_provider_event RPC
  -> GET /api/purchases/:id (poll status)
     -> duitkuProvider.getPaymentStatus()
        -> POST /webapi/api/merchant/transactionStatus
```

## 4. Provider interface mapping

The existing `PaymentProvider` interface requires these methods:

### 4.1 `createPayment(input)` -> `ProviderPaymentResult`

Duitku mapping:
- `input.purchaseId` -> `merchantOrderId` (prepend with `TL-` for TutorLog prefix)
- `input.amount` -> `paymentAmount` (integer, no decimals)
- `input.method` -> `paymentMethod` (map: `"qris"` -> `"SP"` ShopeePay QRIS, `"va"` -> `"BC"` BCA VA)
- `input.customer.name` -> `customerVaName` + `customerDetail.firstName/lastName`
- `input.customer.email` -> `email`
- `input.callbackUrl` -> `callbackUrl`
- `input.returnUrl` -> `returnUrl`

Response mapping:
- `reference` -> `providerReference`
- `statusCode === "00"` -> `state: "pending"`, else `state: "failed"`
- `paymentUrl` -> `redirectUrl`
- Duitku does not return `channelFee` in create response; use fee from `getPaymentMethod` or hardcode per method
- `qrString` and `vaNumber` stored in provider-response summary for UI display

### 4.2 `getPaymentStatus(reference)` -> `VerifiedProviderEvent`

Duitku mapping:
- Request: `merchantOrderId` = reference, `signature` = `HMAC_SHA256(merchantCode + merchantOrderId, apiKey)`
- Response `statusCode`: `"00"` -> `paid`, `"01"` -> `pending`, `"02"` -> `canceled`
- `fee` from response -> `channelFee`

### 4.3 `verifyCallback(input)` -> `VerifiedProviderEvent`

Duitku callback is `x-www-form-urlencoded`. Parse body fields:
- `merchantOrderId` -> match to purchase
- `resultCode`: `"00"` -> `paid`, `"01"` -> `failed`
- `signature` -> verify: `HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)`
- `reference` -> `providerReference`
- `amount` -> `amount`

### 4.4 `cancelPayment(reference)` -> `{ accepted: boolean }`

Duitku does not provide a direct cancel API. Cancel is handled by:
- TutorLog marks the payment as `canceled` locally.
- The Duitku transaction expires naturally based on `expiryPeriod`.
- Return `{ accepted: true }` for local cancel.

## 5. Environment variables

New variables (replacing iPaymu):

```bash
# Duitku Payment Gateway
DUITKU_MERCHANT_CODE=        # Merchant code from Duitku dashboard
DUITKU_API_KEY=              # API key from Duitku dashboard
DUITKU_BASE_URL=             # https://passport.duitku.com (production) or https://sandbox.duitku.com (sandbox)
DUITKU_CALLBACK_URL=         # https://<domain>/api/webhooks/duitku
DUITKU_RETURN_URL=           # https://<domain>/pembayaran/{purchaseId}

# Master gate (keep existing)
BILLING_PAYMENT_PROVIDER_ENABLED=true
```

Variables to remove (after migration complete):
- `IPAYMU_BASE_URL`
- `IPAYMU_VA`
- `IPAYMU_API_KEY`
- `IPAYMU_CALLBACK_URL`
- `IPAYMU_RETURN_URL`

## 6. File changes required

### 6.1 New files

| File | Purpose |
|------|---------|
| `lib/billing/providers/duitku.ts` | Duitku provider adapter |
| `lib/billing/providers/duitku-signature.ts` | HMAC-SHA256 signing and callback verification |
| `app/api/webhooks/duitku/route.ts` | Webhook callback handler |

### 6.2 Modified files

| File | Change |
|------|--------|
| `lib/billing/providers/index.ts` | Conditional factory: Duitku or iPaymu based on config |
| `lib/billing/contracts.ts` | Widen `provider` literal from `"ipaymu"` to `"ipaymu" \| "duitku"` |
| `lib/billing/server/payments.ts` | Accept `"duitku"` provider, update `toPaymentStatus()` and callback processing |
| `lib/billing/server/purchases.ts` | Read Duitku env vars for callback/return URLs |
| `lib/billing/fixtures.ts` | Update fixture provider to `"duitku"` or keep generic |
| `.env.local` | Add Duitku env vars |

### 6.3 Removed files (after migration verified)

| File | Reason |
|------|--------|
| `lib/billing/providers/ipaymu.ts` | Replaced by Duitku adapter |
| `lib/billing/providers/ipaymu-signature.ts` | Replaced by Duitku signature module |
| `app/api/webhooks/ipaymu/route.ts` | Replaced by Duitku webhook |
| `scripts/test-ipaymu-signature-contract.mjs` | iPaymu-specific test |

## 7. Data model impact

No schema changes. The `payments` table already stores `provider` as a string. The `provider_events` table stores raw payloads. The existing `process_billing_provider_event` RPC accepts `p_provider` as a parameter, so it works with any provider string.

The only change is that new payments will have `provider = 'duitku'` instead of `provider = 'ipaymu'`.

## 8. Callback IP whitelist

Duitku requires IP whitelisting for callbacks:

**Production:** `182.23.85.8`, `182.23.85.9`, `182.23.85.10`, `182.23.85.13`, `182.23.85.14`, `103.177.101.184`, `103.177.101.185`, `103.177.101.186`, `103.177.101.189`, `103.177.101.190`

**Sandbox:** `182.23.85.11`, `182.23.85.12`, `103.177.101.187`, `103.177.101.188`

Port: 80 or 443. URL must be publicly accessible.

## 9. Fee structure (for checkout display)

| Method | Duitku Fee | TutorLog absorbs? |
|--------|-----------|-------------------|
| QRIS | 0.7% | Yes |
| VA (BCA) | Rp5.000 | No (user pays) |
| VA (Mandiri) | Rp4.000 | No (user pays) |
| VA (others) | Rp1.500-3.000 | No (user pays) |

The checkout displays channel fee before payment creation. QRIS fee is absorbed by TutorLog as per existing design.

## 10. Verification strategy

- Sandbox registration and API key retrieval.
- Create transaction sandbox test (QRIS and VA).
- Callback signature verification test.
- Status check sandbox test.
- Full redirect flow sandbox test.
- Webhook endpoint accessibility test (use ngrok or similar for local dev).
- State mapping verification against `process_billing_provider_event` RPC.
- Fee display accuracy in checkout.

## 11. Risks

- Duitku account approval time for production (sandbox is instant).
- Callback IP whitelisting may require Vercel allowlisting or a relay.
- QRIS `qrString` needs client-side QR rendering (already handled in existing UI).
- Duitku does not support direct cancel; relies on expiry.
- Settlement timing varies by method (documented as "real time or < 1 hour" for instant withdraw).

## 12. Completion criteria

This design is ready for implementation when:

- Duitku sandbox account is registered and API keys are obtained.
- Sandbox transaction creates successfully for both QRIS and VA.
- Callback signature verification passes in sandbox.
- The `PaymentProvider` interface accommodates Duitku without changes to UI, entitlement, or purchase domains.
- Environment variables are documented and `.env.local` is updated.
