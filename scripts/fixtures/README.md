# Lynk webhook fixtures

`lynk-test-url.redacted.json` records the nesting and primitive types observed from
the Lynk dashboard's **Test URL** request on 2026-08-26. The captured request had a
98-byte JSON body and returned HTTP 200 from the staging Worker. String values and
the timestamp are deterministic replacements.

`lynk-payment-received.redacted.json` follows the `payment.received` schema published
in the Lynk Webhook Postman documentation. It is a documentation-derived contract,
not evidence of a real TutorLog purchase. Customer identity, references, message ID,
product UUID, and timestamp are deterministic non-production values.

Do not treat the payment fixture as proof of TutorLog product UUIDs, real platform
fees, or a successful entitlement grant. Those fields remain pending until the first
approved real transaction is captured and reviewed.
