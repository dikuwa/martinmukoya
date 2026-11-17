import assert from "node:assert/strict";
import test from "node:test";
import { financialDocumentIsPublic, sharedDocumentIsPublic, newShareToken } from "../src/lib/shared-document-access";
import { redactShareUrls } from "../src/lib/analytics-redaction";

const financial = { status: "ISSUED", shareRevokedAt: null, voidedAt: null };
const share = { shortCode: "x".repeat(32), shareEnabled: true, expiresAt: null, documentType: "financial", financialDocument: financial };
test("all public document entry points reject revoked/void/draft/expired/short links", () => {
 assert.equal(sharedDocumentIsPublic(share), true);
 for (const status of ["VOID", "DRAFT"]) assert.equal(sharedDocumentIsPublic({ ...share, financialDocument: { ...financial, status } }), false);
 for (const field of ["shareRevokedAt", "voidedAt"]) assert.equal(financialDocumentIsPublic({ ...financial, [field]: new Date() }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, shareEnabled: false }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, expiresAt: new Date(0) }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, shortCode: "old1234" }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, documentType: "business", businessDocument: { status: "REVOKED", revokedAt: null } }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, documentType: "business", businessDocument: { status: "SENT", revokedAt: null } }), true);
 for (const status of ["SUPERSEDED", "EXPIRED", "ARCHIVED", "REVOKED"]) assert.equal(sharedDocumentIsPublic({ ...share, documentType: "business", businessDocument: { status, revokedAt: null } }), false);
 assert.equal(sharedDocumentIsPublic({ ...share, documentType: "business", businessDocument: { status: "SENT", revokedAt: new Date() } }), false);
});
test("new shares have 192 bits of entropy and no collisions in synthetic sample", () => {
 const tokens = Array.from({ length: 1000 }, newShareToken);
 assert.equal(new Set(tokens).size, 1000);
 assert.ok(tokens.every(token => /^[\w-]{32}$/.test(token)));
});
test("analytics strips bearer URLs in automatic URL/referrer and nested custom properties", () => {
 assert.deepEqual(redactShareUrls({ token: "posthog-api-key" }), { token: "posthog-api-key" });
 const token = newShareToken();
 const properties = { $current_url: `https://example.com/d/${token}?a=1`, $referrer: `https://example.com/documents/share/${token}`, nested: [{ page: `/api/documents/share/${token}/download`, shareToken: token }] };
 const result = JSON.stringify(redactShareUrls(properties));
 assert.equal(result.includes(token), false);
 assert.match(result, /redacted/);
 assert.equal(redactShareUrls("/projects/example"), "/projects/example");
});
