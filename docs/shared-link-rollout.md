# Shared document security rollout

New links use 24 random bytes (192 bits). Public access now rejects existing short codes under 22 characters, disabled/expired shares, draft/revoked business documents, and draft/void/revoked financial documents. Old short links already sent to clients will stop working when this application change deploys. This is an intentional revocation; do not deploy without arranging replacement delivery.

1. Inventory affected links as an administrator, without placing bearer tokens in logs or analytics:

   ```sql
   SELECT id, "documentType", "financialDocumentId", "businessDocumentId", "shareEnabled"
   FROM public."SharedDocument" WHERE length("shortCode") < 22;
   ```

2. Coordinate replacement with clients. Use the existing admin Shared Documents **Regenerate** action for each still-valid document. Regeneration rotates the code in place (the document relation is unique), enables its new link, and permanently invalidates the old URL and its financial legacy token in the same transaction. Do not redirect short links to replacements: that would preserve the weak credential. Do not regenerate void/revoked/draft documents.
3. Distribute replacement links through the normal authorized client channel. No automatic client messages or bulk production updates are part of this patch.
4. Deploy the application changes; check a synthetic active new link, old short link, disabled link, voided document link, legacy URL, download, accept, and decline. Missing rate-limit infrastructure returns service unavailable rather than permitting access.
5. Keep a record of replacement completion without retaining share secrets in analytics. New Referrer-Policy is no-referrer; PostHog capture recursively redacts share URL paths/referrers and session recording is disabled.

Legacy long financial UUID links can redirect only while both the financial document and any existing share remain valid. A revoked existing share cannot be resurrected through the legacy route. Voiding a financial document and reversing a receipt revoke its share in the same database transaction.

## Completed production rollout — 17 November 2026

All 23 existing weak codes were rotated. Nine valid shares remain enabled under
new tokens; fourteen are disabled because they were already disabled or belong
to non-shareable documents. Associated financial legacy credentials were cleared.
Administrators can retrieve the replacement links for authorized client delivery.
No client messages were sent automatically by the link migration. Production
synthetic tests verified active links and denial of old, void and revoked links.
